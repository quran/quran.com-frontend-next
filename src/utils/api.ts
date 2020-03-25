export const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://lobbychatapi.herokuapp.com'
    : 'http://localhost:3000';
export const makeUrl = (path: string) => `${apiUrl}${path}`;
