import { useCallback } from 'react';

import { logErrorToSentry } from '@/lib/sentry';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { enrollUser } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';

/**
 * Hook for enrolling logged-in users in a course.
 * Returns a stable memoized function that handles enrollment.
 *
 * Error handling:
 * - Logs errors to Sentry automatically
 * - Returns { success: boolean, error?: Error } for caller to handle
 * - Does NOT throw errors (safe for automatic enrollment)
 *
 * @returns {Function} Enroll function that takes courseId and enrollmentMethod
 */
const useEnrollUser = () => {
  const enroll = useCallback(
    async (
      courseId: string,
      enrollmentMethod: EnrollmentMethod,
    ): Promise<{ success: boolean; error?: Error }> => {
      if (!isLoggedIn()) {
        return { success: false };
      }

      try {
        const { success } = await enrollUser({
          courseId,
          enrollmentMethod,
        });
        return { success };
      } catch (error) {
        logErrorToSentry(error, {
          transactionName: 'useEnrollUser',
          metadata: { courseId, enrollmentMethod },
        });
        return { success: false, error: error as Error };
      }
    },
    [],
  );

  return enroll;
};

export default useEnrollUser;
