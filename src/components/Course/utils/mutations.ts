import { Course, Lesson } from '@/types/auth/Course';
import { makeGetCourseUrl, makeGetLessonUrlPrefix } from '@/utils/auth/apiPaths';

/**
 * Given an ordered list of lessons and a list of completed lessons:
 *
 * – If all of them are completed, return the first
 * - If none of them are completed, return the first
 * - If only some of them are completed, return the 1st uncompleted lesson.
 *
 * @param {Lesson[]} lessons
 *
 * @returns {string}
 */
export const getContinueFromLesson = (lessons: Lesson[]): string => {
  if (!lessons) {
    return null;
  }
  const completedLessonIds = lessons
    .filter((lesson) => lesson.isCompleted)
    .map((lesson) => lesson.id);
  const numberOfCompletedLessons = completedLessonIds.length;
  // if no lessons were completed, return the first lesson
  if (numberOfCompletedLessons === 0) {
    return lessons[0].slug;
  }
  // if all lessons were completed, return the first lesson
  if (numberOfCompletedLessons === lessons.length) {
    return lessons[0].slug;
  }
  // 1. make sure the lessons are sorted by day
  const sortedLessons = lessons.sort((a, b) => a.day - b.day);
  // 2. pick first uncompleted lesson
  for (let index = 0; index < sortedLessons.length; index += 1) {
    // if the lessons has not been completed, return in
    if (!completedLessonIds.includes(sortedLessons[index].id)) {
      return sortedLessons[index].slug;
    }
  }
  return null;
};

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
export const getUpdatedLessonDataAfterCompletion = (
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
export const getUpdatedCourseDataAfterCompletion = (
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
      updatedCourseData.continueFromLesson = getContinueFromLesson(updatedCourseData.lessons);
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
export const mutateCachedLessonsAfterCompletion = (
  mutatorFunction: any,
  courseSlug: string,
  completedLessonId: string,
): void => {
  const courseLessonsUrlRegex = `^${makeGetLessonUrlPrefix(courseSlug)}/.+`;
  mutatorFunction(courseLessonsUrlRegex, (cachedLessonData: Lesson) =>
    getUpdatedLessonDataAfterCompletion(cachedLessonData, completedLessonId),
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
export const mutateCachedCourseAfterCompletion = (
  mutatorFunction: any,
  courseSlug: string,
  completedLessonId: string,
): void => {
  mutatorFunction(makeGetCourseUrl(courseSlug), (cachedCourseData: Course) =>
    getUpdatedCourseDataAfterCompletion(cachedCourseData, completedLessonId),
  );
};

/**
 * we need to update all the cached lessons of the course to set the current lesson as completed
 *
 * @param {any} mutatorFunction
 * @param {string} courseSlug
 *
 * @returns {void}
 */
export const mutateCachedLessonsAfterFeedback = (
  mutatorFunction: any,
  courseSlug: string,
): void => {
  const courseLessonsUrlRegex = `^${makeGetLessonUrlPrefix(courseSlug)}/.+`;
  mutatorFunction(courseLessonsUrlRegex, (cachedLessonData: Lesson) =>
    getUpdatedLessonDataAfterFeedback(cachedLessonData),
  );
};

/**
 * update local cache of the course to set the current lesson as completed in the lessons array
 *
 * @param {any} mutatorFunction
 * @param {string} courseSlug
 *
 * @returns {void}
 */
export const mutateCachedCourseAfterFeedback = (mutatorFunction: any, courseSlug: string): void => {
  mutatorFunction(makeGetCourseUrl(courseSlug), (cachedCourseData: Course) =>
    getUpdatedCourseDataAfterFeedback(cachedCourseData),
  );
};

/**
 * This function receives the cached course data and the id of the lesson that was just completed
 * and expects to return the updated course data with the lesson marked as completed
 * which will be used to update the local cache without having to call the API again.
 *
 * @param {Course} cachedCourseData
 * @returns {Course}
 */
export const getUpdatedCourseDataAfterFeedback = (cachedCourseData: Course): Course => {
  if (cachedCourseData) {
    const updatedCourseData = { ...cachedCourseData };
    updatedCourseData.userHasFeedback = true;
    return updatedCourseData;
  }
  return cachedCourseData;
};

/**
 * This function receives the cached lesson data and the id of the lesson that was just completed
 * and expects to return the updated lesson data with the lesson marked as completed
 * which will be used to update the local cache without having to call the API again.
 *
 * @param {Lesson} cachedLessonData
 * @returns {Lesson}
 */
export const getUpdatedLessonDataAfterFeedback = (cachedLessonData: Lesson): Lesson => {
  if (cachedLessonData) {
    const updatedLessonData = { ...cachedLessonData };
    // if the lesson has a course, we should update it to userHasFeedback = true
    if (cachedLessonData?.course) {
      updatedLessonData.course = {
        ...updatedLessonData.course,
        userHasFeedback: true,
      };
    }
    return updatedLessonData;
  }
  return cachedLessonData;
};
