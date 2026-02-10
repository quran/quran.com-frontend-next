import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './RepeatLearningPlan.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { Course } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

const RepeatLearningPlan: React.FC<Props> = ({ course }) => {
  const { t } = useTranslation('learn');
  const router = useRouter();
  const { id, slug, lessons } = course;

  const onRepeatClicked = () => {
    logButtonClick('repeat_learning_plan', { courseId: id });
    if (lessons?.length > 0) {
      router.push(getLessonNavigationUrl(slug, lessons[0].slug));
    }
  };

  return (
    <Button size={ButtonSize.Small} className={styles.repeatButton} onClick={onRepeatClicked}>
      {t('repeat-learning-plan')}
    </Button>
  );
};

export default RepeatLearningPlan;
