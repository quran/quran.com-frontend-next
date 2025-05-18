import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ActionButtons.module.scss';
import AddReflectionModal from './AddReflectionModal';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import QuestionMarkIcon from '@/icons/question-mark.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  lessonId: string;
  isCompleted: boolean;
}

const ReflectionButton: React.FC<Props> = ({ lessonId, isCompleted }) => {
  const { t } = useTranslation('learn');
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);

  const onAddReflectionClick = () => {
    logButtonClick('add_lesson_reflection', {
      lessonId,
      isCompleted,
    });
  };

  return (
    <>
      <div className={styles.reflectionButtonContainer}>
        <Button
          size={ButtonSize.Small}
          onClick={onAddReflectionClick}
          href="https://quranreflect.com"
          isNewTab
          type={ButtonType.Success}
        >
          {t('add-reflection')}
        </Button>
        <button
          type="button"
          className={styles.helpIconInButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsReflectionModalOpen(true);
          }}
          aria-label={t('help-about-reflection')}
        >
          <QuestionMarkIcon />
        </button>
      </div>
      <AddReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
      />
    </>
  );
};

export default ReflectionButton;
