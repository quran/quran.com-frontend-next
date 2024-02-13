import React from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './CourseMaterial.module.scss';

import CompletedTick from '@/components/Course/CompletedTick';
import { Lesson } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  lessons: Lesson[];
  currentLessonId: string;
  courseSlug: string;
  isModal?: boolean;
};

const CourseMaterial: React.FC<Props> = ({
  lessons,
  currentLessonId,
  courseSlug,
  isModal = false,
}) => {
  const { t, lang } = useTranslation('learn');
  const router = useRouter();

  const onLessonClicked = (lessonId: string, slug: string) => {
    logButtonClick('sidebar_syllabus_lesson', {
      lessonId,
      courseSlug,
    });
    router.push(getLessonNavigationUrl(courseSlug, slug));
  };

  return (
    <div
      className={classNames(styles.container, {
        [styles.modalContainer]: isModal,
      })}
    >
      {!isModal && <p className={styles.heading}>{t('learning-plan-material')}</p>}
      {lessons.map((lesson, index) => {
        const dayNumber = index + 1;
        const { title, isCompleted, id, slug } = lesson;

        const onClickHandler = () => {
          onLessonClicked(id, slug);
        };

        return (
          <div
            role="button"
            tabIndex={index}
            onClick={onClickHandler}
            onKeyDown={onClickHandler}
            key={id}
            className={classNames(styles.lessonContainer, {
              [styles.currentLesson]: id === currentLessonId,
            })}
          >
            <div>
              <span className={styles.day}>{`${toLocalizedNumber(dayNumber, lang)}: `}</span>
              <span>
                {title}
                {isCompleted ? <CompletedTick /> : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseMaterial;
