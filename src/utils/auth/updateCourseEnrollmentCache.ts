import { MutatorCallback } from 'swr';

import { Course } from '@/types/auth/Course';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';

type MutateFn = (url: string, callback: MutatorCallback) => void;

/**
 * Updates the course enrollment status in SWR cache.
 *
 * @param {MutateFn} mutate - SWR mutate function (without revalidation)
 * @param {string} courseSlug - The course slug used to construct the cache key
 * @param {boolean} isEnrolled - The new enrollment status
 */
const updateCourseEnrollmentCache = (
  mutate: MutateFn,
  courseSlug: string,
  isEnrolled: boolean,
): void => {
  mutate(makeGetCourseUrl(courseSlug), (currentCourse: Course) => {
    if (!currentCourse) {
      return currentCourse;
    }
    return {
      ...currentCourse,
      isUserEnrolled: isEnrolled,
    };
  });
};

export default updateCourseEnrollmentCache;
