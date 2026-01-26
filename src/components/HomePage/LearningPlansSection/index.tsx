import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './LearningPlansSection.module.scss';
import Loading from './Loading';

import DataFetcher from '@/components/DataFetcher';
import Card from '@/components/HomePage/Card';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { selectLearningPlanLanguageIsoCodes } from '@/redux/slices/defaultSettings';
import { TestId } from '@/tests/test-ids';
import { Course, CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getCourseNavigationUrl, getCoursesNavigationUrl } from '@/utils/navigation';

const learningPlansSorter = (a: Course, b: Course) => {
  // Enrolled but unfinished courses come first
  if (a.isCompleted === false && b.isCompleted !== false) return -1;
  if (a.isCompleted !== false && b.isCompleted === false) return 1;

  // New courses (isCompleted undefined) come second
  if (a.isCompleted === undefined && b.isCompleted === true) return -1;
  if (a.isCompleted === true && b.isCompleted === undefined) return 1;

  return 0;
};

const LearningPlansSection = () => {
  const { t } = useTranslation('home');
  const languageIsoCodes = useSelector(selectLearningPlanLanguageIsoCodes);
  const resolvedLanguageIsoCodes =
    languageIsoCodes && languageIsoCodes.length > 0 ? languageIsoCodes : ['en'];

  const onSeeMoreClicked = () => {
    logButtonClick('homepage_learning_plans_see_more');
  };

  const onLearningPlanCardClicked = (slug: string) => {
    logButtonClick('homepage_learning_plans_card', {
      slug,
    });
  };

  return (
    <DataFetcher
      loading={Loading}
      fetcher={privateFetcher}
      queryKey={makeGetCoursesUrl({ myCourses: false, languages: resolvedLanguageIsoCodes })}
      render={(data: CoursesResponse) => {
        const courses = data?.data;
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
          return null;
        }
        const sortedCourses = [...courses].sort(learningPlansSorter);
        const firstNonEnrolledIndex = sortedCourses.findIndex(
          (course) => typeof course.isCompleted === 'undefined',
        );
        const hasEnrolledCourses = sortedCourses.some(
          (course) => typeof course.isCompleted !== 'undefined',
        );

        return (
          <>
            <div className={styles.header} data-testid="learning-plans-section">
              <h1>{t(hasEnrolledCourses ? 'continue-learning-plan' : 'start-learning-plan')}</h1>
              <div>
                <Link
                  variant={LinkVariant.Blend}
                  href={getCoursesNavigationUrl()}
                  className={styles.seeMore}
                  onClick={onSeeMoreClicked}
                >
                  {t('see-more-learning-plans')}
                </Link>
              </div>
            </div>
            <div className={styles.cardsContainer} data-testid={TestId.COURSES_LIST}>
              {sortedCourses.map((course, index) => {
                const courseUrl = getCourseNavigationUrl(course.slug);
                const { isCompleted } = course;
                const userHasEnrolled = typeof isCompleted !== 'undefined';
                const enrolledButNotCompleted = userHasEnrolled && !isCompleted;
                const hasCompletedCourse = isCompleted === true;
                const isFirstNonEnrolledCourse =
                  !userHasEnrolled && index === firstNonEnrolledIndex;

                return (
                  <div key={course.id} className={styles.learnPlanCard}>
                    <Card
                      className={styles.card}
                      link={courseUrl}
                      onClick={() => onLearningPlanCardClicked(course.slug)}
                    >
                      <div className={styles.thumbnailWrapper}>
                        <Image
                          src={course.thumbnail || ''}
                          alt={course.title}
                          fill
                          className={styles.thumbnail}
                          sizes="(max-width: 768px) 42vw, 54vw"
                        />
                        {hasCompletedCourse ? (
                          <div className={styles.completedPill}>{t('learn:completed')}</div>
                        ) : (
                          enrolledButNotCompleted && (
                            <div className={styles.enrolledPill}>{t('learn:enrolled')}</div>
                          )
                        )}
                        {isFirstNonEnrolledCourse && (
                          <div className={styles.newPill}>{t('common:new')}</div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </>
        );
      }}
    />
  );
};

export default LearningPlansSection;
