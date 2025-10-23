import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './CourseFeedback.module.scss';
import CourseFeedbackModal from './CourseFeedbackModal';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import { Course } from '@/types/auth/Course';
import { getUserType } from '@/utils/auth/guestCourseEnrollment';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

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
  const router = useRouter();

  /**
   * listen to changes from the parent component. This will happen when the user
   * completes last lesson of the course.
   */
  useEffect(() => {
    const loggedIn = isLoggedIn();
    if (shouldOpenModal && loggedIn) {
      setIsModalOpen(true);
    }
  }, [shouldOpenModal]);

  const onAddFeedbackClicked = () => {
    const loggedIn = isLoggedIn();
    const userType = getUserType();

    logButtonClick('add_course_feedback', {
      source,
      userType,
    });

    // If user is a guest, redirect to login/registration
    if (!loggedIn) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }

    // Otherwise, open feedback modal for logged-in users
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
