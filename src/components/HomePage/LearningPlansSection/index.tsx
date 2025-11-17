import React from 'react';

import classNames from 'classnames';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './LearningPlansSection.module.scss';
import Loading from './Loading';

import DataFetcher from '@/components/DataFetcher';
import Card from '@/components/HomePage/Card';
import NewLabel from '@/dls/Badge/NewLabel';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ArrowIcon from '@/public/icons/arrow.svg';
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

  const onSeeMoreClicked = () => {
    logButtonClick('homepage_learning_plans_see_more');
  };

  const onLearningPlanCardClicked = (slug: string) => {
    logButtonClick('homepage_learning_plans_card', {
      slug,
    });
  };

  const onStartOrContinueLearningClicked = (isCompleted: boolean, slug: string) => {
    logButtonClick('homepage_learning_plans_start_or_continue', {
      slug,
      enrolledButNotCompleted: isCompleted,
    });
  };

  return (
    <>
      <div className={styles.header}>
        <h1>{t('learning-plan')}</h1>
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
      <DataFetcher
        loading={Loading}
        fetcher={privateFetcher}
        queryKey={makeGetCoursesUrl({ myCourses: false })}
        render={(data: CoursesResponse) => {
          const sortedCourses = [...data.data].sort(learningPlansSorter);
          const firstNonEnrolledIndex = sortedCourses.findIndex(
            (c) => typeof c.isCompleted === 'undefined',
          );

          return (
            <div className={styles.cardsContainer}>
              {sortedCourses.map((course, index) => {
                const { isCompleted } = course;
                const courseUrl = getCourseNavigationUrl(course.slug);
                const userHasEnrolled = typeof isCompleted !== 'undefined';
                const enrolledButNotCompleted = userHasEnrolled && !isCompleted;
                const isFirstNonEnrolledCourse =
                  !userHasEnrolled && index === firstNonEnrolledIndex;

                return (
                  <div key={course.id} className={styles.learnPlanCard}>
                    <Card
                      className={styles.card}
                      link={courseUrl}
                      onClick={() => onLearningPlanCardClicked(course.slug)}
                    >
                      <div className={styles.cardWrapper}>
                        <Image
                          width={150}
                          height={100}
                          src={course.thumbnail}
                          alt={course.title}
                          className={styles.thumbnail}
                        />
                        <div className={styles.cardContent}>
                          <div className={styles.learningPlanTitle}>
                            <span>{course.title}</span>
                            {isFirstNonEnrolledCourse && <NewLabel />}
                          </div>

                          <div
                            className={classNames(styles.learningPlanStatus, {
                              [styles.enrolledPlanStatus]: userHasEnrolled,
                            })}
                          >
                            {enrolledButNotCompleted && (
                              <div className={styles.enrolledPill}>{t('learn:enrolled')}</div>
                            )}
                            {userHasEnrolled && isCompleted && (
                              <div className={styles.completedPill}>{t('learn:completed')}</div>
                            )}
                            <Link
                              className={styles.startLearningLink}
                              variant={LinkVariant.Highlight}
                              href={courseUrl}
                              onClick={() =>
                                onStartOrContinueLearningClicked(
                                  enrolledButNotCompleted,
                                  course.slug,
                                )
                              }
                            >
                              <div className={styles.startLearningLinkContent}>
                                <span>
                                  {enrolledButNotCompleted
                                    ? t('learn:continue-learning')
                                    : t('learn:start-learning')}
                                </span>
                                <IconContainer
                                  size={IconSize.Xsmall}
                                  icon={<ArrowIcon />}
                                  shouldForceSetColors={false}
                                  className={styles.startLearningLinkIcon}
                                />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </>
  );
};

export default LearningPlansSection;
