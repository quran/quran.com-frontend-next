import { useCallback } from 'react';

import { logErrorToSentry } from '@/lib/sentry';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { enrollUser } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';

/**
 * Hook for enrolling logged-in users in a course.
 * Returns a function that can be called with enrollmentMethod.
 *
 * @returns {Function} Enroll function that takes courseId and enrollmentMethod
 */
const useEnrollUser = () => {
  const userLoggedIn = isLoggedIn();

  const enroll = useCallback(
    async (courseId: string, enrollmentMethod: EnrollmentMethod) => {
      if (!userLoggedIn) {
        return;
      }

      try {
        await enrollUser({
          courseId,
          enrollmentMethod,
        });
      } catch (error) {
        logErrorToSentry(error, {
          metadata: {
            context: 'enroll_user',
            courseId,
            enrollmentMethod,
          },
        });
        throw error;
      }
    },
    [userLoggedIn],
  );

  return enroll;
};

export default useEnrollUser;
