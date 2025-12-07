import { useCallback, useEffect, useRef, useState } from 'react';

import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import { logErrorToSentry } from '@/lib/sentry';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import EnrollmentResult from '@/types/auth/EnrollmentResult';
import { enrollUser } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import updateCourseEnrollmentCache from '@/utils/course';

interface EnrollOptions {
  /**
   * If true, suppresses error logging to Sentry.
   * Useful for automatic enrollment where errors should be silent.
   */
  silent?: boolean;
  /**
   * Override the course slug for cache updates.
   * Useful when the slug isn't known until enrollment time.
   */
  courseSlug?: string;
}

interface UseCourseEnrollmentReturn {
  /**
   * Enrolls the user in the course.
   * Handles auth check, API call, cache update, and error logging.
   */
  enroll: (
    courseId: string,
    enrollmentMethod: EnrollmentMethod,
    options?: EnrollOptions,
  ) => Promise<EnrollmentResult>;
  /** Whether an enrollment operation is in progress */
  isEnrolling: boolean;
}

/**
 * Executes the enrollment API call and handles the result.
 *
 * @returns {Promise<EnrollmentResult>} The enrollment result with status
 */
const executeEnrollment = async (
  courseId: string,
  enrollmentMethod: EnrollmentMethod,
  slugForCache: string | undefined,
  options: EnrollOptions,
  mutate: ReturnType<typeof useMutateWithoutRevalidation>,
): Promise<EnrollmentResult> => {
  try {
    const result = await enrollUser({ courseId, enrollmentMethod });

    if (result.success) {
      if (slugForCache) {
        updateCourseEnrollmentCache(mutate, slugForCache, true);
      }
      return { status: 'success' };
    }

    // API returned success: false
    if (!options.silent) {
      logErrorToSentry(new Error('Enrollment API returned success: false'), {
        transactionName: 'useCourseEnrollment',
        metadata: { courseId, enrollmentMethod, courseSlug: slugForCache },
      });
    }

    return { status: 'error' };
  } catch (error) {
    // Log errors to Sentry unless silent
    if (!options.silent) {
      logErrorToSentry(error, {
        transactionName: 'useCourseEnrollment',
        metadata: { courseId, enrollmentMethod, courseSlug: slugForCache },
      });
    }

    return { status: 'error', error: error as Error };
  }
};

/**
 * Hook for managing course enrollment with automatic cache updates.
 *
 * Features:
 * - Checks login status before attempting enrollment
 * - Updates SWR cache on success
 * - Logs errors to Sentry
 * - Returns discriminated union for proper error handling
 * - Handles race conditions with mounted ref
 *
 * @param {string} [courseSlug] - The course slug for cache key construction (optional if passed in options)
 * @returns {UseCourseEnrollmentReturn} Object with enroll function and loading state
 *
 * @example
 * // Manual enrollment (with UI feedback)
 * const { enroll, isEnrolling } = useCourseEnrollment(courseSlug);
 * const result = await enroll(courseId, EnrollmentMethod.MANUAL);
 * if (result.status === 'success') {
 *   router.push(lessonUrl);
 * }
 *
 * @example
 * // Automatic enrollment (silent, with dynamic slug)
 * const { enroll } = useCourseEnrollment();
 * await enroll(courseId, EnrollmentMethod.AUTOMATIC, { silent: true, courseSlug });
 */
const useCourseEnrollment = (courseSlug?: string): UseCourseEnrollmentReturn => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const mutate = useMutateWithoutRevalidation();
  const isMountedRef = useRef(true);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const enroll = useCallback(
    async (
      courseId: string,
      enrollmentMethod: EnrollmentMethod,
      options: EnrollOptions = {},
    ): Promise<EnrollmentResult> => {
      // Check authentication first
      if (!isLoggedIn()) {
        return { status: 'not_logged_in' };
      }

      // Determine which slug to use for cache
      const slugForCache = options.courseSlug || courseSlug;

      if (isMountedRef.current) {
        setIsEnrolling(true);
      }

      const result = await executeEnrollment(
        courseId,
        enrollmentMethod,
        slugForCache,
        options,
        mutate,
      );

      if (isMountedRef.current) {
        setIsEnrolling(false);
      }

      return result;
    },
    [courseSlug, mutate],
  );

  return { enroll, isEnrolling };
};

export default useCourseEnrollment;
