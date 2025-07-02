import React, { useCallback, useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './ReflectionBody.module.scss';

import ReflectionDisclaimerMessage from '@/components/QuranReader/ReflectionView/ReflectionDisclaimerMessage';
import ReflectionItem from '@/components/QuranReader/ReflectionView/ReflectionItem';
import ReflectionNotAvailableMessage from '@/components/QuranReader/ReflectionView/ReflectionNotAvailableMessage';
import TafsirEndOfScrollingActions from '@/components/QuranReader/TafsirView/TafsirEndOfScrollingActions';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import Button from '@/dls/Button/Button';
import Separator from '@/dls/Separator/Separator';
import { selectAyahReflectionsLanguages } from '@/redux/slices/defaultSettings';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getReflectionNavigationUrl } from '@/utils/navigation';
import { getReflectionLanguages } from '@/utils/quranReflect/locale';
import { getQuranReflectVerseUrl } from '@/utils/quranReflect/navigation';
import { isFirstVerseOfSurah, isLastVerseOfSurah, makeVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';
import ContentType from 'types/QuranReflect/ContentType';

interface Props {
  selectedChapterId: string;
  selectedVerseNumber: string;
  data: AyahReflectionsResponse;
  scrollToTop: () => void;
  setSelectedVerseNumber: (verseNumber: string) => void;
  selectedContentType: ContentType;
  isModal?: boolean;
}

const ReflectionBody: React.FC<Props> = ({
  selectedChapterId,
  selectedVerseNumber,
  data,
  scrollToTop,
  setSelectedVerseNumber,
  selectedContentType,
  isModal = false,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const reduxReflectionLanguages = useSelector(selectAyahReflectionsLanguages);
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
    const verseKey = makeVerseKey(Number(selectedChapterId), Number(newVerseNumber));
    fakeNavigate(getReflectionNavigationUrl(verseKey, selectedContentType), lang);
    setSelectedVerseNumber(newVerseNumber);
  }, [
    lang,
    scrollToTop,
    selectedChapterId,
    selectedVerseNumber,
    setSelectedVerseNumber,
    selectedContentType,
  ]);

  const loadPrevVerse = useCallback(() => {
    const newVerseNumber = String(Number(selectedVerseNumber) - 1);
    logButtonClick('reflection_prev_verse');
    scrollToTop();
    setSelectedVerseNumber(newVerseNumber);
    const verseKey = makeVerseKey(Number(selectedChapterId), Number(newVerseNumber));
    fakeNavigate(getReflectionNavigationUrl(verseKey, selectedContentType), lang);
  }, [
    lang,
    scrollToTop,
    selectedChapterId,
    selectedVerseNumber,
    setSelectedVerseNumber,
    selectedContentType,
  ]);

  const filteredReflections = useMemo(() => {
    const allowedLanguages = getReflectionLanguages(lang, reduxReflectionLanguages);
    const reflections = data?.data || [];
    return reflections.filter((reflection) => {
      if (!reflection?.languageId) {
        return true;
      }
      return allowedLanguages.includes(reflection.languageId as (typeof allowedLanguages)[number]);
    });
  }, [data?.data, lang, reduxReflectionLanguages]);

  const hasReflections = filteredReflections.length > 0;
  const onReadMoreClicked = () => {
    logButtonClick('read_more_reflections');
  };

  return (
    <div className={styles.container}>
      {!isModal && (
        <>
          <VerseAndTranslation
            from={Number(selectedVerseNumber)}
            to={Number(selectedVerseNumber)}
            chapter={Number(selectedChapterId)}
          />
          <div className={styles.separatorContainer}>
            <Separator />
          </div>
        </>
      )}
      {!hasReflections ? (
        <ReflectionNotAvailableMessage contentType={selectedContentType} />
      ) : (
        <ReflectionDisclaimerMessage contentType={selectedContentType} />
      )}
      {filteredReflections.map((reflection) => (
        <ReflectionItem
          key={reflection.id}
          reflection={reflection}
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
        />
      ))}
      <div className={styles.readMoreButtonContainer}>
        <Button
          href={getQuranReflectVerseUrl(selectedChapterId, selectedVerseNumber)}
          onClick={onReadMoreClicked}
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
