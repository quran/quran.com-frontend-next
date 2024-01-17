import React, { useEffect, useState } from 'react';

import classNames from 'classnames';

import styles from './MultiStepProgressBar.module.scss';

import CompletedTick from '@/components/Course/CompletedTick';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  identifier: string;
  defaultActiveIndex?: number;
  steps: {
    id: string;
    isCompleted: boolean;
    onClick: () => void;
  }[];
};

const MultiStepProgressBar: React.FC<Props> = ({ identifier, steps, defaultActiveIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  useEffect(() => {
    setActiveIndex(defaultActiveIndex);
  }, [defaultActiveIndex]);

  const onStepClicked = (index: number) => {
    logButtonClick('multi_step_progress-bar', {
      identifier,
      index,
    });
    setActiveIndex(index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const { id, isCompleted, onClick } = step;

          const onClicked = () => {
            onClick();
            onStepClicked(index);
          };

          return (
            <span
              key={id}
              className={classNames(styles.circle, {
                [styles.active]: index === activeIndex,
              })}
              role="button"
              tabIndex={0}
              onClick={onClicked}
              onKeyDown={onClicked}
            >
              {isCompleted ? <CompletedTick /> : index + 1}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default MultiStepProgressBar;
