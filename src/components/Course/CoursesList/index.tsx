import React, { useMemo } from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './LessonsList.module.scss';

import useCoursesList from '@/components/Course/CoursesList/useCoursesList';
import Card, { CardSize } from '@/dls/Card/Card';
import Link, { LinkVariant } from '@/dls/Link/Link';
import Pill from '@/dls/Pill';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { CoursesResponse } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getCoursesNavigationUrl,
  getCourseNavigationUrl,
  getLessonNavigationUrl,
} from '@/utils/navigation';

type Props = {
  initialResponse: CoursesResponse;
  isMyCourses: boolean;
  languages?: string[];
};

const MIN_COURSES_COUNT = 6;

const CoursesList: React.FC<Props> = ({ initialResponse, isMyCourses, languages }) => {
  const { t } = useTranslation('learn');
  const { courses, hasNextPage, isLoadingMore, sentinelRef } = useCoursesList({
    initialResponse,
    isMyCourses,
    languages,
  });

  const onMyCourses = () => {
    logButtonClick('user_no_courses_link');
  };

  const onAllCoursesClicked = () => {
    logButtonClick('all_courses_link');
  };

  const comingSoonPlaceholders = useMemo(() => {
    if (isMyCourses || courses.length >= MIN_COURSES_COUNT) {
      return [];
    }
    const missingCoursesCount = MIN_COURSES_COUNT - courses.length;
    const placeholderIndexes: number[] = [];
    for (let index = 0; index < missingCoursesCount; index += 1) {
      placeholderIndexes.push(index);
    }
    return placeholderIndexes;
  }, [courses.length, isMyCourses]);

  const shouldShowEmptyMyCourses = isMyCourses && courses.length === 0 && !hasNextPage;

  // if the user has no courses, show a message
  if (shouldShowEmptyMyCourses) {
    return (
      <span>
        <Trans
          i18nKey="learn:empty-learning-plans"
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
      <div className={styles.container} data-testid="courses-list">
        {courses.map((course) => {
          const { slug, id, continueFromLesson, title, isCompleted, thumbnail } = course;
          const navigateTo = continueFromLesson
            ? getLessonNavigationUrl(slug, continueFromLesson)
            : getCourseNavigationUrl(slug);
          return (
            <Link key={id} href={navigateTo}>
              <Card
                shouldShowFullTitle
                imgSrc={thumbnail}
                title={
                  <div className={styles.titleContainer}>
                    {title}
                    {isCompleted ? <Pill>{t('completed')}</Pill> : ''}
                  </div>
                }
                imgAlt={title}
                size={CardSize.Large}
                className={classNames(styles.cardContainer, styles.comingSoonContainer)}
              />
            </Link>
          );
        })}
        {comingSoonPlaceholders.map((placeholderIndex) => {
          return (
            <Card
              key={`coming-soon-${placeholderIndex}`}
              imgSrc="https://images.quran.com/coming-soon.png"
              size={CardSize.Large}
              className={classNames(styles.cardContainer, styles.comingSoonContainer)}
              title={t('coming-soon')}
            />
          );
        })}
      </div>
      {hasNextPage && (
        <div ref={sentinelRef} className={styles.loadingMore}>
          {isLoadingMore && <Spinner size={SpinnerSize.Small} />}
        </div>
      )}
      {isMyCourses && (
        <div className={styles.allCourses}>
          <Link
            variant={LinkVariant.Highlight}
            onClick={onAllCoursesClicked}
            href={getCoursesNavigationUrl()}
          >
            {t('all-learning-plans')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default CoursesList;
