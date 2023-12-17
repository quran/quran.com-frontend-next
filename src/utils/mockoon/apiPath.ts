import stringify from '../qs-stringify';

const getAuthApiPath = (path: string): string => `http://localhost:3025/${path}`;

const makeUrl = (url: string, parameters?: Record<string, unknown>): string => {
  if (!parameters) {
    return getAuthApiPath(url);
  }
  return getAuthApiPath(`${url}${`?${stringify(parameters)}`}`);
};

// TODO: move this to the main api.ts file after BE is ready
export const makeGetCoursesUrl = () => makeUrl('courses');
// TODO: move this to the main api.ts file after BE is ready
export const makeGetCourseUrl = (slugId: string) => makeUrl(`courses/${slugId}`);
