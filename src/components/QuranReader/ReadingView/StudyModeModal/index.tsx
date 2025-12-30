import React, { useState, useCallback, useContext, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import StudyModeBody from './StudyModeBody';
import styles from './StudyModeModal.module.scss';

import SurahAndAyahSelection from '@/components/QuranReader/TafsirView/SurahAndAyahSelection';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import Spinner from '@/dls/Spinner/Spinner';
import ArrowIcon from '@/icons/arrow.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import { fetcher } from 'src/api';
import DataContext from 'src/contexts/DataContext';
import Verse from 'types/Verse';
import Word from 'types/Word';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  word: Word;
  verse?: Verse;
  highlightedWordLocation?: string;
}

interface VerseResponse {
  verse: Verse;
}

const StudyModeModal: React.FC<Props> = ({ isOpen, onClose, word, verse: initialVerse, highlightedWordLocation }) => {
  const { t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const initialChapterId = getChapterNumberFromKey(word.verseKey).toString();
  const initialVerseNumber = getVerseNumberFromKey(word.verseKey).toString();
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && isMounted) {
      setSelectedChapterId(initialChapterId);
      setSelectedVerseNumber(initialVerseNumber);
    }
    return () => { isMounted = false; };
  }, [isOpen, initialChapterId, initialVerseNumber]);

  const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;
  const queryKey = isOpen ? makeByVerseKeyUrl(verseKey, {
    words: true,
    translationFields: 'resource_name,language_id',
    translations: selectedTranslations.join(','),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
  }) : null;

  const { data, isValidating } = useSWR<VerseResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const currentVerse = data?.verse || (verseKey === `${initialChapterId}:${initialVerseNumber}` ? initialVerse : undefined);
  const handleChapterChange = useCallback((newChapterId: string) => {
    setSelectedChapterId(newChapterId);
    setSelectedVerseNumber('1');
  }, []);
  const handleVerseChange = useCallback((newVerseNumber: string) => setSelectedVerseNumber(newVerseNumber), []);
  const handlePreviousVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    if (currentVerseNum > 1) {
      setSelectedVerseNumber(String(currentVerseNum - 1));
    } else {
      const prevChapterId = Number(selectedChapterId) - 1;
      if (prevChapterId >= 1 && chaptersData[prevChapterId]) {
        setSelectedChapterId(String(prevChapterId));
        setSelectedVerseNumber(String(chaptersData[prevChapterId]?.versesCount || 1));
      }
    }
  }, [selectedChapterId, selectedVerseNumber, chaptersData]);
  const handleNextVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const currentChapter = chaptersData[Number(selectedChapterId)];
    if (currentChapter && currentVerseNum < currentChapter.versesCount) {
      setSelectedVerseNumber(String(currentVerseNum + 1));
    } else {
      const nextChapterId = Number(selectedChapterId) + 1;
      if (nextChapterId <= 114 && chaptersData[nextChapterId]) {
        setSelectedChapterId(String(nextChapterId));
        setSelectedVerseNumber('1');
      }
    }
  }, [selectedChapterId, selectedVerseNumber, chaptersData]);

  const canNavigatePrev = Number(selectedChapterId) > 1 || Number(selectedVerseNumber) > 1;
  const canNavigateNext = Number(selectedChapterId) < 114 ||
    (Number(selectedChapterId) === 114 && Number(selectedVerseNumber) < (chaptersData[114]?.versesCount || 0));

  const header = (
    <div className={styles.header}>
      <div className={styles.selectionWrapper}>
        <SurahAndAyahSelection
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          onChapterIdChange={handleChapterChange}
          onVerseNumberChange={handleVerseChange}
        />
      </div>
      <Button size={ButtonSize.Small} variant={ButtonVariant.Ghost} onClick={handlePreviousVerse}
        className={`${styles.navButton} ${styles.prevButton}`} ariaLabel="Previous verse" isDisabled={!canNavigatePrev}>
        <ArrowIcon />
      </Button>
      <Button size={ButtonSize.Small} variant={ButtonVariant.Ghost} onClick={handleNextVerse}
        className={styles.navButton} ariaLabel="Next verse" isDisabled={!canNavigateNext}>
        <ArrowIcon />
      </Button>
    </div>
  );

  if (!isOpen || !chaptersData) return null;

  const renderContent = () => {
    if (isValidating && !data) return <div className={styles.loadingContainer}><Spinner /></div>;
    if (currentVerse) return <StudyModeBody verse={currentVerse} bookmarksRangeUrl="" highlightedWordLocation={highlightedWordLocation} />;
    return <div className={styles.errorContainer}><p>{t('error:general')}</p></div>;
  };

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      onEscapeKeyDown={onClose}
      header={header}
      hasCloseButton
      contentClassName={styles.contentModal}
      innerContentClassName={styles.innerContent}
    >
      {renderContent()}
    </ContentModal>
  );
};

export default StudyModeModal;
