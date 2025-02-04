import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Answer from '../Answer';
import QuestionHeader from '../QuestionHeader';

import styles from './QuestionsList.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Collapsible from '@/dls/Collapsible/Collapsible';
import LoadingSpinner from '@/dls/Spinner/Spinner';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import { logEvent } from '@/utils/eventLogger';
import { fakeNavigate, getQuestionNavigationUrl } from '@/utils/navigation';

type Props = {
  questions: Question[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

const QuestionsList: React.FC<Props> = ({
  questions,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const { lang } = useTranslation();
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const router = useRouter();

  const onQuestionCollapseOpenChange = (isOpen: boolean, questionId: string) => {
    logEvent('question_collapse_open', {
      isOpen,
    });
    setOpenQuestionId(isOpen ? questionId : null);
    if (isOpen) {
      fakeNavigate(getQuestionNavigationUrl(questionId), lang);
    } else {
      fakeNavigate(router.asPath, router.locale);
    }
  };

  return (
    <div className={styles.container}>
      {questions?.map((question) => (
        <Collapsible
          title={
            <QuestionHeader body={question.body} theme={question.theme} type={question.type} />
          }
          key={question.id}
          prefix={<ChevronDownIcon />}
          shouldRotatePrefixOnToggle
          isDefaultOpen={false}
          shouldOpen={openQuestionId === question.id}
          onOpenChange={(isOpen) => {
            onQuestionCollapseOpenChange(isOpen, question?.id);
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
