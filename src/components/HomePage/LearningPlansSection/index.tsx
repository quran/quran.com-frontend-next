import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './LearningPlansSection.module.scss';
import Loading from './Loading';

import Card from '@/components/HomePage/Card';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { Course } from '@/types/auth/Course';
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

type LearningPlansSectionProps = {
  courses: Course[];
};

const LearningPlansSection = ({ courses }: LearningPlansSectionProps) => {
  const { t } = useTranslation('home');

  const onSeeMoreClicked = () => {
    logButtonClick('homepage_learning_plans_see_more');
  };

  const onLearningPlanCardClicked = (slug: string) => {
    logButtonClick('homepage_learning_plans_card', {
      slug,
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
      {!courses?.length ? (
        <Loading />
      ) : (
        (() => {
          const sortedCourses = [...courses].sort(learningPlansSorter);
          const firstNonEnrolledIndex = sortedCourses.findIndex(
            (course) => typeof course.isCompleted === 'undefined',
          );

          return (
            <div className={styles.cardsContainer} data-testid="learning-plans-section">
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
                      shouldPrefetch={false}
                    >
                      <div className={styles.thumbnailWrapper}>
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className={styles.thumbnail}
                          sizes="(max-width: 768px) calc((100vw - 2rem) / 2.1), 54vw"
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
          );
        })()
      )}
    </>
  );
};

export default LearningPlansSection;
