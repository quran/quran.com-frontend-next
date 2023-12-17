/* eslint-disable max-lines */
import { camelizeKeys } from 'humps';

import { makeGetCourseUrl, makeGetCoursesUrl } from './apiPath';

export const fetcher = async function fetcher<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok || res.status === 500 || res.status === 404) {
    throw res;
  }
  const json = await res.json();
  return camelizeKeys(json);
};

// TODO: move this to the main api.ts file after BE is ready
export const getCourses = async (): Promise<any> => fetcher(makeGetCoursesUrl());
export const getCourse = async (courseId: string): Promise<any> =>
  fetcher(makeGetCourseUrl(courseId));
