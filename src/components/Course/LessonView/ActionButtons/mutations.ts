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
 * This function receives the cached lesson data and the id of the lesson that was just completed
 * and expects to return the updated lesson data with the lesson marked as completed
 * which will be used to update the local cache without having to call the API again.
 *
 * @param {Lesson} cachedLessonData
 * @param {string} completedLessonId
 * @returns {Lesson}
 */
export const getUpdatedLessonData = (
  cachedLessonData: Lesson,
  completedLessonId: string,
): Lesson => {
  if (cachedLessonData) {
    const updatedLessonData = { ...cachedLessonData };
    // only set the completed lesson data to completed
    if (updatedLessonData.id === completedLessonId) {
      updatedLessonData.isCompleted = true;
    }
    // if the lesson has a course, we should update the lessons array of the course
    if (cachedLessonData?.course?.lessons) {
      updatedLessonData.course.lessons = mutateLessonAsCompleted(
        updatedLessonData.course.lessons,
        completedLessonId,
      );
    }
    return updatedLessonData;
  }
  return cachedLessonData;
};

/**
 * This function receives the cached course data and the id of the lesson that was just completed
 * and expects to return the updated course data with the lesson marked as completed
 * which will be used to update the local cache without having to call the API again.
 *
 * @param {Course} cachedCourseData
 * @param {string} completedLessonId
 * @returns {Course}
 */
export const getUpdatedCourseData = (
  cachedCourseData: Course,
  completedLessonId: string,
): Course => {
  if (cachedCourseData) {
    const updatedCourseData = { ...cachedCourseData };
    // if the course has lessons, we should update the lessons array
    if (updatedCourseData?.lessons) {
      const completedLessons = updatedCourseData.lessons.filter(
        (loopLesson) => loopLesson.isCompleted,
      );
      // if we are marking the last un-completed lesson in the course, we should mark the course itself as completed
      if (completedLessons.length + 1 === updatedCourseData.lessons.length) {
        updatedCourseData.isCompleted = true;
      }
      updatedCourseData.lessons = mutateLessonAsCompleted(
        updatedCourseData.lessons,
        completedLessonId,
      );
    }
    return updatedCourseData;
  }
  return cachedCourseData;
};

/**
 * we need to update all the cached lessons of the course to set the current lesson as completed
 *
 * @param {any} mutatorFunction
 * @param {string} courseSlug
 * @param {string} completedLessonId
 *
 * @returns {void}
 */
export const mutateCachedLessons = (
  mutatorFunction: any,
  courseSlug: string,
  completedLessonId: string,
): void => {
  const courseLessonsUrlRegex = `^${makeGetLessonUrlPrefix(courseSlug)}/.+`;
  mutatorFunction(courseLessonsUrlRegex, (cachedLessonData: Lesson) =>
    getUpdatedLessonData(cachedLessonData, completedLessonId),
  );
};

/**
 * update local cache of the course to set the current lesson as completed in the lessons array
 *
 * @param {any} mutatorFunction
 * @param {string} courseSlug
 * @param {string} completedLessonId
 *
 * @returns {void}
 */
export const mutateCachedCourse = (
  mutatorFunction: any,
  courseSlug: string,
  completedLessonId: string,
): void => {
  mutatorFunction(makeGetCourseUrl(courseSlug), (cachedCourseData: Course) =>
    getUpdatedCourseData(cachedCourseData, completedLessonId),
  );
};
