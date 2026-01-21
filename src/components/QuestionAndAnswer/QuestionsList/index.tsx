import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Answer from '../Answer';
import QuestionHeader from '../QuestionHeader';

import styles from './QuestionsList.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import LoadingSpinner from '@/dls/Spinner/Spinner';
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
};

const QuestionsList: React.FC<Props> = ({
  questions,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  baseUrl,
}) => {
  const { lang } = useTranslation();
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const router = useRouter();

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
      fakeNavigate(getAnswerNavigationUrl(questionId, verseKey), lang);
    } else {
      // Use provided baseUrl or fallback to router.asPath
      const urlToNavigate = baseUrl || router.asPath;
      fakeNavigate(urlToNavigate, router.locale);
    }
  };

  return (
    <div className={styles.container}>
      {questions?.map((question) => (
        <Collapsible
          direction={CollapsibleDirection.Right}
          headerClassName={styles.header}
          title={
            <QuestionHeader body={question.body} theme={question.theme} type={question.type} />
          }
          key={question.id}
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
      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <Button
            variant={ButtonVariant.Compact}
            shape={ButtonShape.Pill}
            onClick={onLoadMore}
            isDisabled={isLoadingMore}
          >
            {isLoadingMore ? <LoadingSpinner /> : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
