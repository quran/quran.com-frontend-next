import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './LessonsList.module.scss';

import Card, { CardSize } from '@/dls/Card/Card';
import Link, { LinkVariant } from '@/dls/Link/Link';
import SearchIcon from '@/icons/search.svg';
import { Course } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import { getCoursesNavigationUrl, getCourseNavigationUrl } from '@/utils/navigation';

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
          i18nKey="learn:empty-courses"
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
          return (
            <Link
              className={styles.link}
              key={course.id}
              href={getCourseNavigationUrl(course.slug)}
            >
              <Card
                shouldShowFullTitle
                imgSrc={course.image}
                key={course.id}
                title={course.title}
                imgAlt={course.title}
                size={CardSize.Medium}
                actionIcon={<SearchIcon />}
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
            {t('all-courses')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default CoursesList;
