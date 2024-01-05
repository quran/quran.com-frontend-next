import React, { useState } from 'react';

import styles from './MultiStepProgressBar.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
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

  const onStepClicked = (index: number) => {
    logButtonClick('multi_step_progress-bar', {
      identifier,
      index,
    });
    setActiveIndex(index);
  };

  return (
    <div className={styles.progressBar}>
      {steps.map((step, index) => {
        const { isCompleted, id, onClick } = step;

        return (
          <Button
            size={ButtonSize.Small}
            {...(index === activeIndex && { variant: ButtonVariant.Outlined })}
            key={id}
            onClick={() => {
              onStepClicked(index);
              onClick();
            }}
            className={styles.step}
          >
            {/* eslint-disable-next-line i18next/no-literal-string */}
            {isCompleted ? '✓' : index + 1}
          </Button>
        );
      })}
    </div>
  );
};

export default MultiStepProgressBar;
