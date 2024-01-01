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
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  author: string;
  language: string; // language code
  description: string;
  image: string;
  tags: string[];
  dailyMinutes: number;
  lessons?: Lesson[];
};

export interface CoursesResponse extends BaseResponse {
  data: Course[];
}
