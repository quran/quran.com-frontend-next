/**
 * Utilities for managing guest user course enrollment
 * Guest enrollments are stored in localStorage to track which courses
 * a guest user has "enrolled" in for courses with allowGuestAccess=true
 */

import { logErrorToSentry } from '@/lib/sentry';
import { isLoggedIn } from '@/utils/auth/login';

const GUEST_ENROLLED_COURSES_KEY = 'guestEnrolledCourses';

export type UserType = 'logged_in' | 'guest';

/**
 * Get all course IDs that the guest user has enrolled in (internal use only)
 *
 * @returns {string[]} An array of course IDs that the guest user has enrolled in
 *
 */
const getGuestEnrolledCourses = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(GUEST_ENROLLED_COURSES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

/**
 * Check if guest user is enrolled in a specific course
 *
 * @param {string} courseId - The ID of the course to check enrollment for
 * @returns {boolean} True if the guest is enrolled in the course, false otherwise
 *
 * @example
 * const isEnrolled = isGuestEnrolledInCourse('course-123');
 */
export const isGuestEnrolledInCourse = (courseId: string): boolean => {
  const enrolledCourses = getGuestEnrolledCourses();
  return enrolledCourses.includes(courseId);
};

/**
 * Enroll guest user in a course
 * Stores the course ID in localStorage. Idempotent operation.
 *
 * @param {string} courseId - The ID of the course to enroll the guest in
 *
 * @example
 * enrollGuestInCourse('course-123');
 */
export const enrollGuestInCourse = (courseId: string): void => {
  if (typeof window === 'undefined') return;

  const enrolledCourses = getGuestEnrolledCourses();

  if (!enrolledCourses.includes(courseId)) {
    enrolledCourses.push(courseId);
    try {
      localStorage.setItem(GUEST_ENROLLED_COURSES_KEY, JSON.stringify(enrolledCourses));
    } catch (error) {
      logErrorToSentry(error, {
        metadata: {
          context: 'guest_course_enrollment_localstorage',
          courseId,
        },
      });
      // Silently fail - the enrollment will not persist and subsequent checks will return false
    }
  }
};

/**
 * Get the current user type (logged in or guest)
 *
 * @returns {UserType} 'logged_in' if user is authenticated, 'guest' otherwise
 *
 * @example
 * const userType = getUserType();
 * logButtonClick('some_action', { userType });
 */
export const getUserType = (): UserType => {
  return isLoggedIn() ? 'logged_in' : 'guest';
};

/**
 * Check if user (logged in) or guest is enrolled in a course
 * Combines both server-side enrollment status and client-side guest enrollment
 *
 * @param {string} courseId - The ID of the course to check
 * @param {boolean} isUserEnrolled - Server-side enrollment status for logged-in users
 * @returns {boolean} True if either user is enrolled or guest is enrolled
 *
 * @example
 * const isEnrolled = isUserOrGuestEnrolled(course.id, course.isUserEnrolled);
 */
export const isUserOrGuestEnrolled = (courseId: string, isUserEnrolled?: boolean): boolean => {
  return isUserEnrolled || isGuestEnrolledInCourse(courseId);
};
