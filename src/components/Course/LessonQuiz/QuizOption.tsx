import React from 'react';

import classNames from 'classnames';

import styles from './LessonQuiz.module.scss';

import CheckIcon from '@/icons/check.svg';
import CloseIcon from '@/icons/close.svg';

type Props = {
  text: string;
  isSelected: boolean;
  isShowingResult: boolean;
  isCorrectAnswer: boolean;
  onSelect: () => void;
};

const QuizOption: React.FC<Props> = ({
  text,
  isSelected,
  isShowingResult,
  isCorrectAnswer,
  onSelect,
}) => (
  <button
    type="button"
    className={classNames(styles.option, {
      [styles.selected]: isSelected,
      [styles.correct]: isShowingResult && isSelected && isCorrectAnswer,
      [styles.incorrect]: isShowingResult && isSelected && !isCorrectAnswer,
      [styles.correctAnswer]: isShowingResult && !isSelected && isCorrectAnswer,
    })}
    onClick={onSelect}
    disabled={isShowingResult}
  >
    <div className={styles.optionContent}>
      <div
        className={classNames(styles.radioCircle, {
          [styles.radioCircleHidden]: isShowingResult && !isSelected,
        })}
      >
        {isSelected && <div className={styles.radioInner} />}
      </div>
      <span className={styles.optionText}>{text}</span>
    </div>
    {isShowingResult && (isSelected || isCorrectAnswer) && (
      <div className={styles.resultIcon}>
        {isSelected && !isCorrectAnswer ? <CloseIcon /> : <CheckIcon />}
      </div>
    )}
  </button>
);

export default QuizOption;
