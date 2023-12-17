import { BaseResponse } from '../ApiResponses';

export type SyllabusDay = {
  title: string;
  body: string;
};

export type Course = {
  id: number;
  slug: string;
  title: string;
  image: string;
  language?: string;
  description?: string;
  tags?: string[];
  author?: string;
  dailyMins?: number;
  days?: SyllabusDay[];
};

export interface CoursesResponse extends BaseResponse {
  courses: Course[];
}

export interface CourseResponse extends BaseResponse {
  course: Course;
}
