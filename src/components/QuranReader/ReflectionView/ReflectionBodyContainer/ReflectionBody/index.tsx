import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionBody.module.scss';

import ReflectionDisclaimerMessage from '@/components/QuranReader/ReflectionView/ReflectionDisclaimerMessage';
import ReflectionItem, {
  VerseReference,
} from '@/components/QuranReader/ReflectionView/ReflectionItem';
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
import {
  getVerseAndChapterNumbersFromKey,
  isFirstVerseOfSurah,
  isLastVerseOfSurah,
  makeVerseKey,
} from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

/**
 * From reflection data, extract the verse references
 * This is is a temporary function, once we migrate to use Quran.com's API we will probably remove this function
 *
 * @param {object} reflection
 * @returns {VerseReference[]} verseReferences
 */
const getVerseReferencesFromReflection = (reflection: any): VerseReference[] => {
  return reflection.referencedAyahs.map((reference) => {
    const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(reference.key.toString());
    let from;
    let to;

    const verseRange = verseNumber || '';

    if (verseRange.includes('-')) {
      [from, to] = verseRange.split('-');
    } else {
      from = verseRange;
      to = verseRange;
    }

    return {
      chapter: Number(chapterNumber),
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
      {data?.posts?.map((reflection) => (
        <ReflectionItem
          id={reflection.id}
          key={reflection.id}
          date={reflection.createdAt}
          authorName={reflection?.author?.name}
          authorUsername={reflection?.author?.username}
          isAuthorVerified={reflection?.author?.verified}
          reflectionText={reflection?.htmlBody}
          avatarUrl={reflection?.author?.avatarUrl}
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
