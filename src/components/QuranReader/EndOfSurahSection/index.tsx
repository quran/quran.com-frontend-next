import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './EndOfSurahSection.module.scss';
import ExploreCard from './ExploreCard';
import ReadMoreCard from './ReadMoreCard';
import StreakGoalCard from './StreakGoalCard';

import { getChapterMetadata } from '@/api';
import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import BottomActionsModals, {
  ModalType,
} from '@/components/QuranReader/TranslationView/BottomActionsModals';
import useScrollToTop from '@/hooks/useScrollToTop';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { makeChapterMetadataUrl } from '@/utils/apiPaths';

interface EndOfSurahSectionProps {
  chapterNumber: number;
}

const EndOfSurahSection: React.FC<EndOfSurahSectionProps> = ({ chapterNumber }) => {
  const { t, lang } = useTranslation('quran-reader');
  const dispatch = useDispatch();
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

  // Check if the verse used for Answers has clarification questions
  const hasClarificationQuestion = React.useMemo(() => {
    if (!questionsData) return false;
    return !!questionsData[questionsVerseKey]?.types?.[QuestionType.CLARIFICATION];
  }, [questionsData, questionsVerseKey]);

  // Check if any verse in the chapter has questions
  const hasQuestions = React.useMemo(() => {
    if (!questionsData) return false;

    return Object.keys(questionsData).some((key) => {
      const [chapter] = key.split(':');
      return Number(chapter) === chapterNumber && questionsData[key]?.total > 0;
    });
  }, [questionsData, chapterNumber]);

  const { data: metadataResponse } = useSWRImmutable(
    makeChapterMetadataUrl(String(chapterNumber), lang),
    () => getChapterMetadata(String(chapterNumber), lang),
  );

  const handleModalOpen = (modalType: ModalType) => {
    setOpenedModal(modalType);
  };

  const handleStudyModeOpen = (tabId: StudyModeTabId, targetVerseKey: string) => {
    dispatch(openStudyMode({ verseKey: targetVerseKey, activeTab: tabId }));
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
          hasClarificationQuestion={hasClarificationQuestion}
          onModalOpen={handleModalOpen}
          onStudyModeOpen={handleStudyModeOpen}
        />

        <StreakGoalCard cardClassName={styles.card} />
      </div>

      <BottomActionsModals
        verseKey={questionsVerseKey}
        openedModal={openedModal}
        hasQuestions={hasQuestions}
        isTranslationView
        onCloseModal={handleCloseModal}
      />
    </div>
  );
};

export default EndOfSurahSection;
