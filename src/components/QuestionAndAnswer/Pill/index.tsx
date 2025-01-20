import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuestionAndAnswerPill.module.scss';

import Pill from '@/dls/Pill';
import TafsirIcon from '@/icons/book-open.svg';
import CommunityIcon from '@/icons/head-dot.svg';
import ScholarsSayIcon from '@/icons/lighbulb.svg';
import ClarificationIcon from '@/icons/notebook.svg';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';

type Props = {
  type: QuestionType;
  isButton?: boolean;
};

const TYPE_TO_ICON = {
  [QuestionType.TAFSIR]: TafsirIcon,
  [QuestionType.COMMUNITY]: CommunityIcon,
  [QuestionType.CLARIFICATION]: ClarificationIcon,
  [QuestionType.EXPLORE_ANSWERS]: ScholarsSayIcon,
};

const QuestionAndAnswerPill: React.FC<Props> = ({ type, isButton = true }) => {
  const { t } = useTranslation();
  const Icon = TYPE_TO_ICON[type];
  const typeLabel = type.toLowerCase();
  const typeText = t(`quran-reader:q-and-a.${typeLabel}`);
  const prefix = type === QuestionType.EXPLORE_ANSWERS ? ` >` : '';
  return (
    <Pill
      containerClassName={classNames(styles[typeLabel], styles.container, {
        [styles.button]: isButton,
      })}
    >
      <Icon />
      <span>
        {typeText}
        {prefix}
      </span>
    </Pill>
  );
};

export default QuestionAndAnswerPill;
