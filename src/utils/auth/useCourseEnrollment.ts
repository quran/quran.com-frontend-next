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
 * @returns {object} Enroll function, loading state
 *
 * @example
 * const { enroll, isEnrolling } = useCourseEnrollment(courseSlug);
 * const result = await enroll(courseId, EnrollmentMethod.MANUAL);
 * if (result?.success) {
 *   // Handle success
 * } else {
 *   // Handle failure
 * }
 */
const useCourseEnrollment = (courseSlug: string) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const mutate = useMutateWithoutRevalidation();

  const enroll = useCallback(
    async (
      courseId: string,
      enrollmentMethod: EnrollmentMethod,
    ): Promise<{ success: boolean } | undefined> => {
      if (!isLoggedIn()) {
        return undefined;
      }

      setIsEnrolling(true);
      try {
        const result = await enrollUser({ courseId, enrollmentMethod });
        if (result.success) {
          updateCourseEnrollmentCache(mutate, courseSlug, true);
        }
        return result;
      } catch (error) {
        logErrorToSentry(error, {
          transactionName: 'useCourseEnrollment',
          metadata: { courseId, enrollmentMethod },
        });
        return { success: false };
      } finally {
        setIsEnrolling(false);
      }
    },
    [courseSlug, mutate],
  );

  return { enroll, isEnrolling };
};

export default useCourseEnrollment;
