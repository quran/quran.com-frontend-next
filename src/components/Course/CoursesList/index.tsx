import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './LessonsList.module.scss';

import Card, { CardSize } from '@/dls/Card/Card';
import Link, { LinkVariant } from '@/dls/Link/Link';
import Pill from '@/dls/Pill';
import { Course } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getCoursesNavigationUrl,
  getCourseNavigationUrl,
  getLessonNavigationUrl,
} from '@/utils/navigation';

type Props = {
  courses: Course[];
  isMyCourses: boolean;
};

const CoursesList: React.FC<Props> = ({ courses, isMyCourses }) => {
  const { t } = useTranslation('learn');
  const onMyCourses = () => {
    logButtonClick('user_no_courses_link');
  };

  const onAllCoursesClicked = () => {
    logButtonClick('all_courses_link');
  };

  // if the user has no courses, show a message
  if (isMyCourses && courses.length === 0) {
    return (
      <span>
        <Trans
          i18nKey="learn:empty-knowledge-boosters"
          components={{
            link: (
              <Link
                onClick={onMyCourses}
                key={0}
                href={getCoursesNavigationUrl()}
                variant={LinkVariant.Blend}
              />
            ),
          }}
        />
      </span>
    );
  }

  return (
    <div>
      <div className={styles.container}>
        {courses.map((course) => {
          const navigateTo = course.continueFromLesson
            ? getLessonNavigationUrl(course.slug, course.continueFromLesson)
            : getCourseNavigationUrl(course.slug);
          return (
            <Link className={styles.link} key={course.id} href={navigateTo}>
              <Card
                shouldShowFullTitle
                imgSrc={course.image}
                key={course.id}
                title={
                  <div className={styles.titleContainer}>
                    {course.title}
                    {course.isCompleted ? <Pill>{t('completed')}</Pill> : ''}
                  </div>
                }
                imgAlt={course.title}
                size={CardSize.Large}
                className={styles.cardContainer}
              />
            </Link>
          );
        })}
      </div>
      {isMyCourses && (
        <div className={styles.allCourses}>
          <Link
            variant={LinkVariant.Highlight}
            onClick={onAllCoursesClicked}
            href={getCoursesNavigationUrl()}
          >
            {t('all-knowledge-boosters')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default CoursesList;
