import { useCallback } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '@/redux/RootState';
import { enrollInCourse, selectIsGuestEnrolledInCourse } from '@/redux/slices/guestEnrollment';
import { isLoggedIn } from '@/utils/auth/login';

/**
 * Hook to check if user or guest is enrolled in a course
 * For logged-in users: checks server-side enrollment status
 * For guests: checks Redux state
 * @param {string} courseId - The ID of the course to check
 * @param {boolean} isUserEnrolled - Server-side enrollment status for logged-in users
 * @returns {boolean} True if enrolled
 */
export const useIsEnrolled = (courseId: string, isUserEnrolled?: boolean): boolean => {
  const isGuestEnrolled = useSelector((state: RootState) =>
    selectIsGuestEnrolledInCourse(state, courseId),
  );

  if (isLoggedIn()) {
    return Boolean(isUserEnrolled);
  }
  return isGuestEnrolled;
};

/**
 * Hook for enrolling guest in a course
 * @returns {(courseId: string) => void} Function to enroll guest in a course
 */
export const useEnrollGuest = (): ((courseId: string) => void) => {
  const dispatch = useDispatch();

  const enroll = useCallback(
    (courseId: string) => {
      dispatch(enrollInCourse(courseId));
    },
    [dispatch],
  );

  return enroll;
};

export default useIsEnrolled;
