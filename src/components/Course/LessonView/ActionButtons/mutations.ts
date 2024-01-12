import { Course, Lesson } from '@/types/auth/Course';
import { makeGetCourseUrl, makeGetLessonUrlPrefix } from '@/utils/auth/apiPaths';

/**
 * Given a lessons array and a lesson id, it returns a new lessons array
 * after setting the lesson with the given id set as completed.
 *
 * @param {Lesson[]} lessons
 * @param {string} lessonId
 * @returns {Lesson[]}
 */
export const mutateLessonAsCompleted = (lessons: Lesson[], lessonId: string): Lesson[] => {
  const newLessons = [...lessons];
  const lessonIndex = newLessons.findIndex((loopLesson) => loopLesson.id === lessonId);
  // safety check: if the lesson was found in the lessons array, set it as completed
  if (lessonIndex !== -1) {
    newLessons[lessonIndex].isCompleted = true;
  }
  return newLessons;
};

/**
 * we need to update all the cached lessons of the course to set the current lesson as completed
 *
 * @param {any} mutatorFunction
 * @param {string} courseSlug
 * @param {string} lessonId
 *
 * @returns {void}
 */
export const mutateCachedLessons = (
  mutatorFunction: any,
  courseSlug: string,
  lessonId: string,
): void => {
  const courseLessonsUrlRegex = `^${makeGetLessonUrlPrefix(courseSlug)}/.+`;
  mutatorFunction(courseLessonsUrlRegex, (currentLesson: Lesson) => {
    if (currentLesson) {
      const newCurrentLesson = { ...currentLesson, isCompleted: true };
      // if the lesson has a course, we should update the lessons array of the course
      if (currentLesson?.course?.lessons) {
        newCurrentLesson.course.lessons = mutateLessonAsCompleted(
          newCurrentLesson.course.lessons,
          lessonId,
        );
      }
      return newCurrentLesson;
    }
    return currentLesson;
  });
};

/**
 * update local cache of the course to set the current lesson as completed in the lessons array
 *
 * @param {any} mutatorFunction
 * @param {string} courseSlug
 * @param {string} lessonId
 *
 * @returns {void}
 */
export const mutateCachedCourse = (
  mutatorFunction: any,
  courseSlug: string,
  lessonId: string,
): void => {
  mutatorFunction(makeGetCourseUrl(courseSlug), (currentCourse: Course) => {
    if (currentCourse) {
      const newCurrentCourse = { ...currentCourse };
      // if the course has lessons, we should update the lessons array
      if (newCurrentCourse?.lessons) {
        const completedLessons = newCurrentCourse.lessons.filter(
          (loopLesson) => loopLesson.isCompleted,
        );
        // if we are marking the last un-completed lesson in the course, we should mark the course itself as completed
        if (completedLessons.length + 1 === newCurrentCourse.lessons.length) {
          newCurrentCourse.isCompleted = true;
        }
        newCurrentCourse.lessons = mutateLessonAsCompleted(newCurrentCourse.lessons, lessonId);
      }
      return newCurrentCourse;
    }
    return currentCourse;
  });
};
