import React from 'react';

import classNames from 'classnames';

import styles from './QuestionHeader.module.scss';

import QuestionAndAnswerPill from '@/components/QuestionAndAnswer/Pill';
import { Question } from '@/types/QuestionsAndAnswers/Question';

type Props = Partial<Question> & {
  isPage?: boolean;
};

const QuestionHeader: React.FC<Props> = ({ body, theme: themes, type, isPage = false }) => {
  return (
    <div className={styles.header}>
      <div
        className={classNames({
          [styles.summary]: isPage,
        })}
      >
        {body}
      </div>
      <div className={styles.pillContainer}>
        {themes?.map((theme) => (
          <div key={theme} className={styles.theme}>
            {theme}
          </div>
        ))}
        <QuestionAndAnswerPill type={type} isButton={false} />
      </div>
    </div>
  );
};

export default QuestionHeader;
