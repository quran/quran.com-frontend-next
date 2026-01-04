import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './EndOfSurahSection.module.scss';
import ExploreCard from './ExploreCard';
import ReadMoreCard from './ReadMoreCard';

import { getChapterMetadata } from '@/api';
import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import BottomActionsModals, {
  ModalType,
} from '@/components/QuranReader/TranslationView/BottomActionsModals';
import useScrollToTop from '@/hooks/useScrollToTop';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { makeChapterMetadataUrl } from '@/utils/apiPaths';

interface EndOfSurahSectionProps {
  chapterNumber: number;
}

const EndOfSurahSection: React.FC<EndOfSurahSectionProps> = ({ chapterNumber }) => {
  const { t, lang } = useTranslation('quran-reader');
  const selectedTafsirs = useSelector(selectSelectedTafsirs);
  const scrollToTop = useScrollToTop();
  const questionsData = usePageQuestions();
  const [openedModal, setOpenedModal] = useState<ModalType | null>(null);

  // For Tafsir, Reflections, Lessons - always use verse 1
  const verseKey = `${chapterNumber}:1`;

  // For Answers - find the first verse in the chapter that has questions
  const questionsVerseKey = React.useMemo(() => {
    if (!questionsData) return verseKey;

    const verseWithQuestions = Object.keys(questionsData).find((key) => {
      const [chapter] = key.split(':');
      return Number(chapter) === chapterNumber && questionsData[key]?.total > 0;
    });

    return verseWithQuestions || verseKey;
  }, [questionsData, chapterNumber, verseKey]);

  // Check if any verse in the chapter has questions
  const hasQuestions = React.useMemo(() => {
    if (!questionsData) return false;

    return Object.keys(questionsData).some((key) => {
      const [chapter] = key.split(':');
      return Number(chapter) === chapterNumber && questionsData[key]?.total > 0;
    });
  }, [questionsData, chapterNumber]);

  const { data: metadataResponse } = useSWRImmutable(
    makeChapterMetadataUrl(chapterNumber, lang),
    () => getChapterMetadata(chapterNumber, lang),
  );

  const handleModalOpen = (modalType: ModalType) => {
    setOpenedModal(modalType);
  };

  const handleCloseModal = () => {
    setOpenedModal(null);
  };

  const chapterMetadata = metadataResponse?.chapterMetadata;

  return (
    <div className={styles.container} data-testid="end-of-surah-section">
      <h2 className={styles.header}>{t('end-of-surah.header')}</h2>

      <div className={styles.cardsGrid}>
        <ReadMoreCard
          cardClassName={styles.card}
          chapterNumber={chapterNumber}
          nextSummaries={chapterMetadata?.nextChapter?.summaries}
          previousSummaries={chapterMetadata?.previousChapter?.summaries}
          onScrollToTop={scrollToTop}
        />

        <ExploreCard
          cardClassName={styles.card}
          chapterNumber={chapterNumber}
          verseKey={verseKey}
          questionsVerseKey={questionsVerseKey}
          suggestions={chapterMetadata?.suggestions}
          hasQuestions={hasQuestions}
          onModalOpen={handleModalOpen}
        />
      </div>

      <BottomActionsModals
        chapterId={String(chapterNumber)}
        verseNumber="1"
        verseKey={openedModal === ModalType.QUESTIONS ? questionsVerseKey : verseKey}
        tafsirs={selectedTafsirs}
        openedModal={openedModal}
        hasQuestions={hasQuestions}
        isTranslationView
        onCloseModal={handleCloseModal}
      />
    </div>
  );
};

export default EndOfSurahSection;
