import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './StudyModeAnswersTab.module.scss';
import StudyModeTabLayout, { useStudyModeTabScroll } from './StudyModeTabLayout';

import QuestionsList from '@/components/QuestionAndAnswer/QuestionsList';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import useQuestionsPagination from '@/hooks/useQuestionsPagination';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Language from '@/types/Language';
import { getVerseAnswersNavigationUrl } from '@/utils/navigation';
import { makeVerseKey } from '@/utils/verse';

interface StudyModeAnswersTabProps {
  chapterId: string;
  verseNumber: string;
}

const StudyModeAnswersTab: React.FC<StudyModeAnswersTabProps> = ({ chapterId, verseNumber }) => {
  const { t, lang } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { containerRef } = useStudyModeTabScroll();

  const verseKey = makeVerseKey(Number(chapterId), Number(verseNumber));
  const baseUrl = getVerseAnswersNavigationUrl(verseKey);
  const scaleClass = styles[`qna-font-size-${quranReaderStyles.qnaFontScale}`];

  // Use global site language for Q&A
  const { questions, hasMore, isLoadingMore, loadMore, isLoading } = useQuestionsPagination({
    verseKey,
    language: lang as Language,
  });

  const renderBody = () => {
    if (isLoading) return <TafsirSkeleton />;

    if (!questions || questions.length === 0) {
      return (
        <div className={classNames(styles.notAvailableMessage, scaleClass)}>
          {t('quran-reader:questions-not-available')}
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
