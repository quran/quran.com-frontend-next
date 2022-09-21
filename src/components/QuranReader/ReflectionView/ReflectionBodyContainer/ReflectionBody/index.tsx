import React, { useCallback, useContext, useMemo } from 'react';

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
import { fakeNavigate, getVerseReflectionNavigationUrl } from '@/utils/navigation';
import { localeToReflectionLanguages } from '@/utils/quranReflect/locale';
import { getQuranReflectVerseUrl } from '@/utils/quranReflect/navigation';
import { getVerseReferencesFromReflection } from '@/utils/quranReflect/string';
import { isFirstVerseOfSurah, isLastVerseOfSurah, makeVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

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
  const filteredPosts = useMemo(() => {
    return data?.posts?.filter((reflection) =>
      localeToReflectionLanguages(lang).includes(reflection.language),
    );
  }, [data?.posts, lang]);
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
      {filteredPosts?.length === 0 ? (
        <ReflectionNotAvailableMessage />
      ) : (
        <ReflectionDisclaimerMessage />
      )}
      {filteredPosts?.map((reflection) => (
        <ReflectionItem
          id={reflection.id}
          key={reflection.id}
          date={reflection.createdAt}
          authorName={reflection?.author?.name}
          authorUsername={reflection?.author?.username}
          isAuthorVerified={reflection?.author?.verified}
          reflectionText={reflection?.body}
          reflectionLanguage={reflection.language}
          reflectionGroup={reflection?.group}
          reflectionGroupLink={reflection?.groupLink}
          avatarUrl={reflection?.author?.profileImg}
          verseReferences={getVerseReferencesFromReflection(reflection.filters)}
          likesCount={reflection?.likes}
          commentsCount={reflection?.commentsCount}
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          filters={reflection.filters}
          trimmedCitationTexts={reflection.trimmedCitationTexts}
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
