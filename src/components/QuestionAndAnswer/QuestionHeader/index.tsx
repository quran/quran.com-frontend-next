import React from 'react';

import classNames from 'classnames';

import styles from './QuestionHeader.module.scss';

import QuestionAndAnswerPill from '@/components/QuestionAndAnswer/Pill';
import { Question } from '@/types/QuestionsAndAnswers/Question';

type Props = Partial<Question> & {
  isPage?: boolean;
};

const QuestionHeader: React.FC<Props> = ({ body, type, isPage = false }) => {
  return (
    <div className={styles.header}>
      <div dir="auto" className={classNames({ [styles.summary]: isPage })}>
        {body}
      </div>
      <div className={styles.pillContainer}>
        <QuestionAndAnswerPill type={type} isButton={false} />
      </div>
    </div>
  );
};

export default QuestionHeader;
