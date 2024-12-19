import { BaseResponse } from '../ApiResponses';

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  day: number;
  language: string; // language code
  content: string;
  updatedAt: string;
  createdAt: string;
  isFirst: boolean;
  isLast: boolean;
  course: Course;
  isCompleted: boolean;
};

export type CourseAuthor = {
  id: string;
  name: string;
  biography: string;
};

export type CourseEditor = {
  id: string;
  name: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  authors: { author: CourseAuthor }[];
  editors: { editor: CourseEditor }[];
  language: string; // language code
  description: string;
  metaDescription?: string;
  image: string;
  thumbnail: string;
  tags: string[];
  dailyMinutes: number;
  lessons?: Lesson[];
  isUserEnrolled?: boolean;
  isCompleted?: boolean;
  userHasFeedback?: boolean;
  continueFromLesson?: string;
};

export interface CoursesResponse extends BaseResponse {
  data: Course[];
}
