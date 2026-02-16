/* eslint-disable i18next/no-literal-string */
import React, { useMemo, useState } from 'react';

import styles from './LessonQuiz.module.scss';
import QuizOption from './QuizOption';

import { LessonQuizOption, LessonQuizQuestion } from '@/utils/lessonQuizParser';

type Props = {
  lessonSlug: string;
  title: string;
  question: LessonQuizQuestion;
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
};

const createSeededRandom = (seed: number) => {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const shuffleOptions = (options: LessonQuizOption[], seed: string) => {
  const shuffled = [...options];
  const rng = createSeededRandom(hashString(seed));
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const LessonQuiz: React.FC<Props> = ({ lessonSlug, title, question }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const shuffledOptions = useMemo(
    () => shuffleOptions(question.options, `${lessonSlug}:${question.id}`),
    [lessonSlug, question.id, question.options],
  );

  return (
    <div className={styles.quizContainer}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>{title}</h3>
      </div>

      <div className={styles.questionContainer}>
        <p className={styles.questionText}>{question.question}</p>
        <div className={styles.optionsContainer}>
          {shuffledOptions.map((option) => (
            <QuizOption
              key={option.id}
              text={option.text}
              isSelected={selectedOptionId === option.id}
              isShowingResult={selectedOptionId !== null}
              isCorrectAnswer={option.id === question.correctOptionId}
              onSelect={() => setSelectedOptionId(option.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonQuiz;
