import React, { useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './StudyModeAnswersTab.module.scss';
import StudyModeTabLayout, { useStudyModeTabScroll } from './StudyModeTabLayout';

import Error from '@/components/Error';
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
  const { questions, hasMore, isLoadingMore, loadMore, isLoading, error, mutate } =
    useQuestionsPagination({
      verseKey,
      language: lang as Language,
      initialData: questionsInitialData,
    });

  // Auto-close tab when there are no answered questions
  useEffect(() => {
    if (!isLoading && (!questions || questions.length === 0) && switchTab) {
      switchTab(null);
    }
  }, [isLoading, questions, switchTab]);

  const handleRetry = () => {
    mutate?.();
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className={styles.edgeToEdge}>
          <TafsirSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <div className={classNames(styles.edgeToEdge, styles.errorContainer)}>
          <Error error={error} onRetryClicked={handleRetry} />
        </div>
      );
    }

    return (
      <div className={classNames(styles.answersContainer, scaleClass)}>
        <QuestionsList
          questions={questions}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
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
