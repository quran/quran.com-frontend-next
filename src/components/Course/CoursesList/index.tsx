/* eslint-disable max-lines */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './LessonsList.module.scss';

import Card, { CardSize } from '@/dls/Card/Card';
import Link, { LinkVariant } from '@/dls/Link/Link';
import Pill from '@/dls/Pill';
import { Course, CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';
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
const ROWS_BEFORE_END = 4;

const CoursesList: React.FC<Props> = ({ initialResponse, isMyCourses, languages }) => {
  const { t } = useTranslation('learn');
  const onMyCourses = () => {
    logButtonClick('user_no_courses_link');
  };

  const onAllCoursesClicked = () => {
    logButtonClick('all_courses_link');
  };

  const [courses, setCourses] = useState<Course[]>(initialResponse.data);
  const [pagination, setPagination] = useState(initialResponse.pagination);
  const isFetchingMoreRef = useRef(false);
  const lastTriggeredLengthRef = useRef(0);

  useEffect(() => {
    setCourses(initialResponse.data);
    setPagination(initialResponse.pagination);
    lastTriggeredLengthRef.current = 0;
  }, [initialResponse]);

  /**
   * Load more courses when the user scrolls near the bottom of the page
   */
  const loadMoreCourses = useCallback(async () => {
    if (isFetchingMoreRef.current) return;
    if (!pagination?.hasNextPage || !pagination?.endCursor) return;

    isFetchingMoreRef.current = true;
    try {
      const response = (await privateFetcher(
        makeGetCoursesUrl({
          cursor: pagination.endCursor,
          myCourses: isMyCourses,
          languages,
        }),
      )) as CoursesResponse;
      const { data: newCourses = [], pagination: newPagination } = response;
      if (newCourses.length > 0) {
        setCourses((prevCourses) => [...prevCourses, ...newCourses]);
      }
      setPagination((prevPagination) => newPagination ?? prevPagination);
    } catch (error) {
      lastTriggeredLengthRef.current = 0;
    } finally {
      isFetchingMoreRef.current = false;
    }
  }, [isMyCourses, languages, pagination]);

  /**
   * Calculate the threshold in pixels to trigger loading more courses
   * @returns {number}
   */
  const calculateThreshold = () => {
    const cardSelector = `.${styles.cardContainer}`;
    const firstCardElement = document.querySelector<HTMLDivElement>(cardSelector);
    if (!firstCardElement) return window.innerHeight;

    const computedStyle = window.getComputedStyle(firstCardElement);
    const marginBottom = Number.parseFloat(computedStyle.marginBottom) || 0;
    return (firstCardElement.offsetHeight + marginBottom) * ROWS_BEFORE_END;
  };

  /**
   * Create a scroll handler to load more courses when nearing the bottom of the page
   * @param {number} threshold - The threshold in pixels to trigger loading more courses
   * @returns {() => void} - The scroll handler function
   */
  const createScrollHandler = useCallback(
    (threshold: number) => {
      return () => {
        if (isFetchingMoreRef.current) return;

        const scrollPosition = window.scrollY + window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= fullHeight - threshold) {
          if (lastTriggeredLengthRef.current === courses.length) return;
          lastTriggeredLengthRef.current = courses.length;
          loadMoreCourses();
        }
      };
    },
    [loadMoreCourses, courses.length],
  );

  /**
   * Set up scroll and resize event listeners to load more courses when nearing the bottom of the page
   */
  useEffect(() => {
    if (isMyCourses && courses.length === 0) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (!pagination?.hasNextPage || !pagination.endCursor) return undefined;

    let threshold = calculateThreshold();
    const handleScroll = createScrollHandler(threshold);

    const handleResize = () => {
      threshold = calculateThreshold();
      handleScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    courses,
    courses.length,
    createScrollHandler,
    isMyCourses,
    loadMoreCourses,
    pagination.endCursor,
    pagination?.hasNextPage,
  ]);

  // if the user has no courses, show a message
  if (isMyCourses && courses.length === 0) {
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

  let comingSoonCourses = [];
  // if we should put a coming soon placeholder
  if (!isMyCourses && courses.length < MIN_COURSES_COUNT) {
    // just fill the array with 0s
    comingSoonCourses = new Array(MIN_COURSES_COUNT - courses.length).fill(0);
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
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        {comingSoonCourses.map((_, i) => {
          return (
            <Card
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              imgSrc="https://images.quran.com/coming-soon.png"
              size={CardSize.Large}
              className={classNames(styles.cardContainer, styles.comingSoonContainer)}
              title={t('coming-soon')}
            />
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
            {t('all-learning-plans')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default CoursesList;
