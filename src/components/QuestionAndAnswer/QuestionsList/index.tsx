import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import Answer from '../Answer/AnswerBody';
import QuestionHeader from '../QuestionHeader';

import styles from './QuestionsList.module.scss';

import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import LoadingSpinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import { logEvent } from '@/utils/eventLogger';
import { fakeNavigate, getAnswerNavigationUrl } from '@/utils/navigation';

type Props = {
  questions: Question[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  baseUrl?: string;
  initialOpenQuestionId?: string;
};

const QuestionsList: React.FC<Props> = ({
  questions,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  baseUrl,
  initialOpenQuestionId,
}) => {
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(
    initialOpenQuestionId || null,
  );
  const router = useRouter();

  const loadMoreTriggerRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore,
  });

  // Scroll to the initially opened question on mount
  useEffect(() => {
    if (initialOpenQuestionId) {
      const element = document.getElementById(`question-${initialOpenQuestionId}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialOpenQuestionId]);

  const onQuestionCollapseOpenChange = (
    isOpen: boolean,
    questionId: string,
    question: Question,
  ) => {
    logEvent('question_collapse_open', {
      isOpen,
    });
    setOpenQuestionId(isOpen ? questionId : null);
    if (isOpen) {
      const [verseKey] = question?.ranges[0]?.split('-') ?? ['1:1'];
      fakeNavigate(getAnswerNavigationUrl(questionId, verseKey), router.locale);
    } else {
      const urlToNavigate = baseUrl || router.asPath;
      fakeNavigate(urlToNavigate, router.locale);
    }
  };

  return (
    <div className={styles.container}>
      {questions?.map((question) => (
        <Collapsible
          key={question.id}
          id={`question-${question.id}`}
          direction={CollapsibleDirection.Right}
          headerClassName={styles.headerClassName}
          title={
            <QuestionHeader body={question.body} theme={question.theme} type={question.type} />
          }
          prefix={<ChevronDownIcon />}
          shouldRotatePrefixOnToggle
          isDefaultOpen={false}
          shouldOpen={openQuestionId === question.id}
          onOpenChange={(isOpen) => {
            onQuestionCollapseOpenChange(isOpen, question?.id, question);
          }}
        >
          {({ isOpen: isOpenRenderProp }) => {
            if (!isOpenRenderProp) return null;
            return <Answer question={question} />;
          }}
        </Collapsible>
      ))}

      {hasMore &&
        onLoadMore &&
        (isLoadingMore ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size={SpinnerSize.Large} />
          </div>
        ) : (
          <div ref={loadMoreTriggerRef} className={styles.infiniteScrollTrigger} />
        ))}
    </div>
  );
};

export default QuestionsList;
