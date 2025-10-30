import React, { useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CourseFeedback.module.scss';
import CourseFeedbackModal from './CourseFeedbackModal';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import { Course } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  course: Course;
  source: FeedbackSource;
  shouldOpenModal?: boolean;
};

export enum FeedbackSource {
  CoursePage = 'course_page',
  LessonPage = 'lesson_page',
}

const CourseFeedback: React.FC<Props> = ({ source, course, shouldOpenModal = false }) => {
  const { t } = useTranslation('learn');
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * listen to changes from the parent component. This will happen when the user
   * completes last lesson of the course.
   */
  useEffect(() => {
    if (shouldOpenModal) {
      setIsModalOpen(true);
    }
  }, [shouldOpenModal]);

  const onAddFeedbackClicked = () => {
    logButtonClick('add_course_feedback', {
      source,
    });
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <Button size={ButtonSize.Small} type={ButtonType.Primary} onClick={onAddFeedbackClicked}>
        {t('feedback.add-feedback')}
      </Button>
      <CourseFeedbackModal
        course={course}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CourseFeedback;
