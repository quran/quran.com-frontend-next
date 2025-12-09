import { useCallback, useState } from 'react';

import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import { logErrorToSentry } from '@/lib/sentry';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { enrollUser } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import updateCourseEnrollmentCache from '@/utils/auth/updateCourseEnrollmentCache';

/**
 * Hook for enrolling a user in a course with automatic cache updates.
 *
 * @param {string} courseSlug - The course slug for cache invalidation
 * @returns {object} Enroll function and loading state
 *
 * @example
 * const { enroll, isEnrolling } = useCourseEnrollment(courseSlug);
 * await enroll(courseId, EnrollmentMethod.MANUAL);
 */
const useCourseEnrollment = (courseSlug: string) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const mutate = useMutateWithoutRevalidation();

  const enroll = useCallback(
    async (courseId: string, enrollmentMethod: EnrollmentMethod): Promise<void> => {
      if (!isLoggedIn()) {
        return;
      }

      setIsEnrolling(true);
      try {
        await enrollUser({ courseId, enrollmentMethod });
        updateCourseEnrollmentCache(mutate, courseSlug, true);
      } catch (error) {
        logErrorToSentry(error, {
          transactionName: 'useCourseEnrollment',
          metadata: { courseId, enrollmentMethod },
        });
      } finally {
        setIsEnrolling(false);
      }
    },
    [courseSlug, mutate],
  );

  return { enroll, isEnrolling };
};

export default useCourseEnrollment;
