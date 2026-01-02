import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './EndOfSurahSection.module.scss';
import ExploreCard from './ExploreCard';
import ReadMoreCard from './ReadMoreCard';
import StreakGoalCard from './StreakGoalCard';

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

  const verseKey = `${chapterNumber}:1`;
  const hasQuestions = questionsData?.[verseKey]?.total > 0;

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
          suggestions={chapterMetadata?.suggestions}
          hasQuestions={hasQuestions}
          onModalOpen={handleModalOpen}
        />

        <StreakGoalCard cardClassName={styles.card} />
      </div>

      <BottomActionsModals
        chapterId={String(chapterNumber)}
        verseNumber="1"
        verseKey={verseKey}
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
