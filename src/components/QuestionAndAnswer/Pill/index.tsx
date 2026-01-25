import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuestionAndAnswerPill.module.scss';

import Pill from '@/dls/Pill';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';

type Props = {
  type: QuestionType;
  isButton?: boolean;
};

const QuestionAndAnswerPill: React.FC<Props> = ({ type, isButton = true }) => {
  const { t } = useTranslation();
  const typeLabel = type.toLowerCase();
  const typeText = t(`quran-reader:q-and-a.${typeLabel}`);
  const prefix = type === QuestionType.EXPLORE_ANSWERS ? ` >` : '';
  return (
    <Pill
      containerClassName={classNames(styles[typeLabel], styles.container, {
        [styles.button]: isButton,
      })}
    >
      <span>
        {typeText}
        {prefix}
      </span>
    </Pill>
  );
};

export default QuestionAndAnswerPill;
