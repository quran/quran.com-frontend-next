import { useCallback } from 'react';

import { logErrorToSentry } from '@/lib/sentry';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { enrollUser } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';

/**
 * Enrolls a logged-in user in a course.
 *
 * @returns {(courseId: string, enrollmentMethod: EnrollmentMethod) => Promise<{success: boolean}>} Function to enroll user with automatic error handling
 *
 * @example
 * const enroll = useEnrollUser();
 * const { success } = await enroll(courseId, EnrollmentMethod.MANUAL);
 */
const useEnrollUser = () => {
  return useCallback(async (courseId: string, enrollmentMethod: EnrollmentMethod) => {
    if (!isLoggedIn()) {
      return { success: false };
    }

    try {
      return await enrollUser({ courseId, enrollmentMethod });
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'useEnrollUser',
        metadata: { courseId, enrollmentMethod },
      });
      return { success: false };
    }
  }, []);
};

export default useEnrollUser;
