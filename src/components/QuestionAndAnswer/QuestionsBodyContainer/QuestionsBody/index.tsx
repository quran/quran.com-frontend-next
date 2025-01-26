import React from 'react';

import QuestionsList from '@/components/QuestionAndAnswer/QuestionsList';
import styles from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer/ReflectionBody/ReflectionBody.module.scss';
import GroupedVerseAndTranslation from '@/components/Verse/GroupedVerseAndTranslation';
import Separator from '@/dls/Separator/Separator';
import { Question } from '@/types/QuestionsAndAnswers/Question';

interface Props {
  selectedChapterId: string;
  selectedVerseNumber: string;
  questions: Question[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const QuestionsBody: React.FC<Props> = ({
  selectedChapterId,
  selectedVerseNumber,
  questions,
  hasMore,
  isLoadingMore,
  onLoadMore,
}) => {
  return (
    <div className={styles.container}>
      <GroupedVerseAndTranslation
        from={Number(selectedVerseNumber)}
        to={Number(selectedVerseNumber)}
        chapter={Number(selectedChapterId)}
      />
      <div className={styles.separatorContainer}>
        <Separator />
      </div>
      <QuestionsList
        questions={questions}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />
    </div>
  );
};

export default QuestionsBody;
