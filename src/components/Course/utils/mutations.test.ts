/* eslint-disable no-restricted-syntax */
/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { it, expect, describe } from 'vitest';

import {
  mutateLessonAsCompleted,
  getUpdatedCourseDataAfterCompletion,
  getUpdatedLessonDataAfterCompletion,
  getContinueFromLesson,
} from './mutations';

import { Lesson } from '@/types/auth/Course';

const deepEqual = (obj1, obj2) => {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  for (const key in obj1) {
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
};

expect.extend({
  toBeEquivalentObject(received, expected) {
    // if deep equality fails
    if (!deepEqual(received, expected)) {
      return {
        message: () => `Objects are not equivalent.`,
        pass: false,
      };
    }
    return {
      message: () => `Objects are equivalent.`,
      pass: true,
    };
  },
});

describe('mutateLessonAsCompleted', () => {
  it('lesson with correct Id only gets marked as completed', async () => {
    const received = mutateLessonAsCompleted(
      [
        {
          id: '1',
          isCompleted: false,
        },
        {
          id: '2',
          isCompleted: false,
        },
        {
          id: '3',
          isCompleted: false,
        },
      ] as Lesson[],
      '2',
    );
    // @ts-ignore
    expect(received).toBeEquivalentObject([
      {
        id: '1',
        isCompleted: false,
      },
      {
        id: '2',
        isCompleted: true,
      },
      {
        id: '3',
        isCompleted: false,
      },
    ]);
  });
  it('nothing happens when passing non-existent lessonId', async () => {
    const received = mutateLessonAsCompleted(
      [
        {
          id: '1',
          isCompleted: false,
        },
        {
          id: '2',
          isCompleted: false,
        },
        {
          id: '3',
          isCompleted: false,
        },
      ] as Lesson[],
      '5',
    );
    // @ts-ignore
    expect(received).toBeEquivalentObject([
      {
        id: '1',
        isCompleted: false,
      },
      {
        id: '2',
        isCompleted: false,
      },
      {
        id: '3',
        isCompleted: false,
      },
    ]);
  });
});

describe('getUpdatedCourseDataAfterCompletion', () => {
  it('Returns undefined', async () => {
    expect(getUpdatedCourseDataAfterCompletion(undefined, '1')).toEqual(undefined);
  });
  it('Updates course as completed if last lesson is completed', async () => {
    const receivedCourse = {
      id: '1',
      title: 'Title 1',
      isCompleted: false,
      slug: 'course-1',
      lessons: [
        {
          id: '1',
          title: 'Lesson 1',
          slug: 'lesson-1',
          day: 1,
          content: '1',
          isCompleted: false,
        },
        {
          id: '2',
          title: 'Lesson 2',
          slug: 'lesson-2',
          day: 2,
          content: '2',
          isCompleted: true,
        },
      ],
    };
    // @ts-ignore
    expect(getUpdatedCourseDataAfterCompletion(receivedCourse, '1')).toBeEquivalentObject({
      id: '1',
      title: 'Title 1',
      isCompleted: true,
      slug: 'course-1',
      continueFromLesson: 'lesson-1',
      lessons: [
        {
          id: '1',
          title: 'Lesson 1',
          slug: 'lesson-1',
          day: 1,
          content: '1',
          isCompleted: true,
        },
        {
          id: '2',
          title: 'Lesson 2',
          slug: 'lesson-2',
          day: 2,
          content: '2',
          isCompleted: true,
        },
      ],
    });
  });
  it('Updates lesson as completed correctly', async () => {
    const receivedCourse = {
      id: '1',
      title: 'Title 1',
      isCompleted: false,
      slug: 'course-1',
      lessons: [
        {
          id: '1',
          title: 'Lesson 1',
          slug: 'lesson-1',
          day: 1,
          content: '1',
          isCompleted: false,
        },
        {
          id: '2',
          title: 'Lesson 2',
          slug: 'lesson-2',
          day: 2,
          content: '2',
          isCompleted: false,
        },
      ],
    };
    // @ts-ignore
    expect(getUpdatedCourseDataAfterCompletion(receivedCourse, '2')).toBeEquivalentObject({
      id: '1',
      title: 'Title 1',
      isCompleted: false,
      slug: 'course-1',
      continueFromLesson: 'lesson-1',
      lessons: [
        {
          id: '1',
          title: 'Lesson 1',
          slug: 'lesson-1',
          day: 1,
          content: '1',
          isCompleted: false,
        },
        {
          id: '2',
          title: 'Lesson 2',
          slug: 'lesson-2',
          day: 2,
          content: '2',
          isCompleted: true,
        },
      ],
    });
  });
});
describe('getUpdatedLessonDataAfterCompletion', () => {
  it('Returns undefined', async () => {
    expect(getUpdatedLessonDataAfterCompletion(undefined, '1')).toEqual(undefined);
  });
  it("Updates completed lesson's course lessons correctly", async () => {
    const lesson = {
      id: '8',
      title: 'Lesson 8',
      slug: 'lesson-8',
      day: 8,
      content: '8',
      isCompleted: false,
      course: {
        id: '1',
        title: 'Course 1',
        slug: 'course-1',
        lessons: [
          {
            id: '7',
            title: 'The Lens of Quranic Worlds',
            slug: 'the-lens-of-quranic-worlds',
            day: 7,
            content: '7',
            isCompleted: false,
          },
          {
            id: '8',
            title: 'The Lens of Quranic Worlds (Part 2)',
            slug: 'the-lens-of-quranic-worlds-part-2',
            day: 8,
            content: '8',
            isCompleted: false,
          },
          {
            id: '9',
            title: 'The Lens of Quranic Worlds (Part 3)',
            slug: 'the-lens-of-quranic-worlds-part-3',
            day: 9,
            content: '9',
            isCompleted: true,
          },
        ],
      },
    } as Lesson;
    expect(getUpdatedLessonDataAfterCompletion(lesson, '8')).toEqual({
      id: '8',
      title: 'Lesson 8',
      slug: 'lesson-8',
      day: 8,
      content: '8',
      isCompleted: true,
      course: {
        id: '1',
        title: 'Course 1',
        slug: 'course-1',
        lessons: [
          {
            id: '7',
            title: 'The Lens of Quranic Worlds',
            slug: 'the-lens-of-quranic-worlds',
            day: 7,
            content: '7',
            isCompleted: false,
          },
          {
            id: '8',
            title: 'The Lens of Quranic Worlds (Part 2)',
            slug: 'the-lens-of-quranic-worlds-part-2',
            day: 8,
            content: '8',
            isCompleted: true,
          },
          {
            id: '9',
            title: 'The Lens of Quranic Worlds (Part 3)',
            slug: 'the-lens-of-quranic-worlds-part-3',
            day: 9,
            content: '9',
            isCompleted: true,
          },
        ],
      },
    });
  });
  it("Updates another non-completed cached lesson's course lessons correctly", async () => {
    const lesson = {
      id: '8',
      title: 'Lesson 8',
      slug: 'lesson-8',
      day: 8,
      content: '8',
      isCompleted: false,
      course: {
        id: '1',
        title: 'Course 1',
        slug: 'course-1',
        lessons: [
          {
            id: '7',
            title: 'The Lens of Quranic Worlds',
            slug: 'the-lens-of-quranic-worlds',
            day: 7,
            content: '7',
            isCompleted: false,
          },
          {
            id: '8',
            title: 'The Lens of Quranic Worlds (Part 2)',
            slug: 'the-lens-of-quranic-worlds-part-2',
            day: 8,
            content: '8',
            isCompleted: false,
          },
          {
            id: '9',
            title: 'The Lens of Quranic Worlds (Part 3)',
            slug: 'the-lens-of-quranic-worlds-part-3',
            day: 9,
            content: '9',
            isCompleted: true,
          },
        ],
      },
    } as Lesson;
    expect(getUpdatedLessonDataAfterCompletion(lesson, '7')).toEqual({
      id: '8',
      title: 'Lesson 8',
      slug: 'lesson-8',
      day: 8,
      content: '8',
      isCompleted: false,
      course: {
        id: '1',
        title: 'Course 1',
        slug: 'course-1',
        lessons: [
          {
            id: '7',
            title: 'The Lens of Quranic Worlds',
            slug: 'the-lens-of-quranic-worlds',
            day: 7,
            content: '7',
            isCompleted: true,
          },
          {
            id: '8',
            title: 'The Lens of Quranic Worlds (Part 2)',
            slug: 'the-lens-of-quranic-worlds-part-2',
            day: 8,
            content: '8',
            isCompleted: false,
          },
          {
            id: '9',
            title: 'The Lens of Quranic Worlds (Part 3)',
            slug: 'the-lens-of-quranic-worlds-part-3',
            day: 9,
            content: '9',
            isCompleted: true,
          },
        ],
      },
    });
  });
});

describe('getContinueFromLesson', () => {
  it('Returns null when no lessons passed', async () => {
    expect(getContinueFromLesson(null)).toEqual(null);
  });
  it('Returns first lesson slug when no lessons are completed', async () => {
    expect(
      getContinueFromLesson([
        // @ts-ignore
        {
          id: '1',
          slug: 'slug-1',
          day: 1,
          content: '1',
          isCompleted: false,
        },
        // @ts-ignore
        {
          id: '2',
          slug: 'slug-2',
          day: 2,
          content: '2',
          isCompleted: false,
        },
        // @ts-ignore
        {
          id: '3',
          slug: 'slug-3',
          day: 3,
          content: '3',
          isCompleted: false,
        },
      ]),
    ).toEqual('slug-1');
  });
  it('Returns correct lesson slug when some lessons are completed', async () => {
    expect(
      getContinueFromLesson([
        // @ts-ignore
        {
          id: '1',
          slug: 'slug-1',
          day: 1,
          content: '1',
          isCompleted: true,
        },
        // @ts-ignore
        {
          id: '2',
          slug: 'slug-2',
          day: 2,
          content: '2',
          isCompleted: false,
        },
        // @ts-ignore
        {
          id: '3',
          slug: 'slug-3',
          day: 3,
          content: '3',
          isCompleted: true,
        },
      ]),
    ).toEqual('slug-2');
    expect(
      getContinueFromLesson([
        // @ts-ignore
        {
          id: '1',
          slug: 'slug-1',
          day: 1,
          content: '1',
          isCompleted: false,
        },
        // @ts-ignore
        {
          id: '2',
          slug: 'slug-2',
          day: 2,
          content: '2',
          isCompleted: true,
        },
        // @ts-ignore
        {
          id: '3',
          slug: 'slug-3',
          day: 3,
          content: '3',
          isCompleted: true,
        },
      ]),
    ).toEqual('slug-1');
    expect(
      getContinueFromLesson([
        // @ts-ignore
        {
          id: '1',
          slug: 'slug-1',
          day: 1,
          content: '1',
          isCompleted: true,
        },
        // @ts-ignore
        {
          id: '2',
          slug: 'slug-2',
          day: 2,
          content: '2',
          isCompleted: true,
        },
        // @ts-ignore
        {
          id: '3',
          slug: 'slug-3',
          day: 3,
          content: '3',
          isCompleted: false,
        },
      ]),
    ).toEqual('slug-3');
  });
  it('Returns first lesson slug when all lessons are completed', async () => {
    expect(
      getContinueFromLesson([
        // @ts-ignore
        {
          id: '1',
          slug: 'slug-1',
          day: 1,
          content: '1',
          isCompleted: true,
        },
        // @ts-ignore
        {
          id: '2',
          slug: 'slug-2',
          day: 2,
          content: '2',
          isCompleted: true,
        },
        // @ts-ignore
        {
          id: '3',
          slug: 'slug-3',
          day: 3,
          content: '3',
          isCompleted: true,
        },
      ]),
    ).toEqual('slug-1');
  });
});
