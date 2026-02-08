import React, { useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './StudyModeAnswersTab.module.scss';
import StudyModeTabLayout, { useStudyModeTabScroll } from './StudyModeTabLayout';

import QuestionsList from '@/components/QuestionAndAnswer/QuestionsList';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import useQuestionsPagination from '@/hooks/useQuestionsPagination';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Language from '@/types/Language';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import { getVerseAnswersNavigationUrl } from '@/utils/navigation';
import { makeVerseKey } from '@/utils/verse';

interface StudyModeAnswersTabProps {
  chapterId: string;
  verseNumber: string;
  switchTab?: (tabId: StudyModeTabId | null) => void;
  questionId?: string;
  questionsInitialData?: AyahQuestionsResponse;
}

const StudyModeAnswersTab: React.FC<StudyModeAnswersTabProps> = ({
  chapterId,
  verseNumber,
  switchTab,
  questionId,
  questionsInitialData,
}) => {
  const { lang } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { containerRef } = useStudyModeTabScroll();

  const verseKey = makeVerseKey(Number(chapterId), Number(verseNumber));
  const baseUrl = getVerseAnswersNavigationUrl(verseKey);
  const scaleClass = styles[`qna-font-size-${quranReaderStyles.qnaFontScale}`];

  // Use global site language for Q&A
  const {
    questions,
    hasMore,
    isLoadingMore,
    isValidating,
    loadMore,
    isLoading,
    hasErrorInPages,
    error,
    mutate,
  } = useQuestionsPagination({
    verseKey,
    language: lang as Language,
    initialData: questionsInitialData,
  });

  // Auto-close tab when there are no answered questions
  useEffect(() => {
    const hasQuestions = questions?.length ?? 0;
    if (!isLoading && hasQuestions === 0 && !(hasErrorInPages || error) && switchTab) {
      switchTab(null);
    }
  }, [isLoading, questions, hasErrorInPages, error, switchTab]);

  const handleRetry = () => {
    mutate?.();
  };

  const renderBody = () => {
    if (isLoading) return <TafsirSkeleton />;

    return (
      <div className={classNames(styles.answersContainer, scaleClass)}>
        <QuestionsList
          questions={questions}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isValidating={isValidating}
          onLoadMore={loadMore}
          hasErrorInPages={hasErrorInPages}
          error={error}
          onRetry={handleRetry}
          baseUrl={baseUrl}
          initialOpenQuestionId={questionId}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <StudyModeTabLayout fontType="qna" selectionControl={null} body={renderBody()} />
    </div>
  );
};

export default StudyModeAnswersTab;
